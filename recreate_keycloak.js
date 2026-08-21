const http = require('http');

async function run() {
  const adminUser = 'admin';
  const adminPass = 'admin';
  const baseUrl = 'http://158.178.227.145:8080';
  
  console.log("Getting admin token...");
  const tokenRes = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'admin-cli',
      username: adminUser,
      password: adminPass,
      grant_type: 'password'
    })
  });
  
  if (!tokenRes.ok) {
    throw new Error('Failed to get token: ' + await tokenRes.text());
  }
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log("Creating Realm...");
  const realmRes = await fetch(`${baseUrl}/admin/realms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: "tenderease",
      realm: "tenderease",
      enabled: true,
      registrationAllowed: true,
    })
  });
  if (!realmRes.ok && realmRes.status !== 409) {
    console.error('Failed to create realm:', await realmRes.text());
  }

  console.log("Creating Client...");
  await fetch(`${baseUrl}/admin/realms/tenderease/clients`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      clientId: "tenderease-frontend",
      publicClient: true,
      directAccessGrantsEnabled: true,
      standardFlowEnabled: true,
      redirectUris: ["*"],
      webOrigins: ["*"]
    })
  });

  const roles = ['ADMIN', 'PROCUREMENT_OFFICER', 'CAO', 'VENDOR'];
  console.log("Creating Roles...");
  for (const role of roles) {
    await fetch(`${baseUrl}/admin/realms/tenderease/roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: role })
    });
  }

  const users = [
    { username: 'admin', roles: ['ADMIN'] },
    { username: 'officer', roles: ['PROCUREMENT_OFFICER'] },
    { username: 'cao', roles: ['CAO'] },
    { username: 'vendor', roles: ['VENDOR'] },
  ];

  console.log("Creating Users...");
  for (const u of users) {
    await fetch(`${baseUrl}/admin/realms/tenderease/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: u.username,
        enabled: true,
        credentials: [{ type: "password", value: u.username, temporary: false }]
      })
    });
    
    const searchRes = await fetch(`${baseUrl}/admin/realms/tenderease/users?username=${u.username}`, { headers });
    const searchData = await searchRes.json();
    if (!searchData || searchData.length === 0) continue;
    const userId = searchData[0].id;

    const roleMappings = [];
    for (const r of u.roles) {
      const roleRes = await fetch(`${baseUrl}/admin/realms/tenderease/roles/${r}`, { headers });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        roleMappings.push({ id: roleData.id, name: roleData.name });
      }
    }

    if (roleMappings.length > 0) {
      await fetch(`${baseUrl}/admin/realms/tenderease/users/${userId}/role-mappings/realm`, {
        method: 'POST',
        headers,
        body: JSON.stringify(roleMappings)
      });
    }
    console.log(`Created user '${u.username}' with roles ${u.roles.join(', ')} (Password is also '${u.username}')`);
  }
  
  console.log("Done recreating Keycloak state.");
}

run().catch(console.error);
