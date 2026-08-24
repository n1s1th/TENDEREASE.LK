const fs = require('fs');
fetch('http://localhost:8081/api/officers/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: fs.readFileSync('payload.json')
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
