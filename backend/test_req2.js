 // wait, node 22 has global fetch

const payload = {
  procuringEntityType: "Government Institution",
  headDesignation: "Secretary",
  address: {
    country: "Sri Lanka",
    streetLine1: "Test 1",
    city: "Colombo"
  },
  personalLandPhone: "0112345678",
  officialEmail: "new_officer123@example.com",
  liaisonOfficer: {
    title: "Mr",
    name: "Test Name",
    nic: "991234567V",
    mobile: "0771234567",
    email: "new_liaison123@example.com"
  },
  termsAccepted: true,
  keycloakUserId: "test-user-id"
};

fetch('http://localhost:8081/api/officers/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(async r => {
  console.log('Status:', r.status);
  console.log('Body:', await r.text());
})
.catch(console.error);
