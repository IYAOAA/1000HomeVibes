// create_admin.js
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const username = process.env.ADMIN_USERNAME || process.argv[2];
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!username || !password) {
  console.log('Usage: ADMIN_USERNAME=admin ADMIN_PASSWORD=yourpass node create_admin.js');
  process.exit(1);
}

(async () => {
  const hash = await bcrypt.hash(password, 10);
  const auth = { username, passwordHash: hash };
  fs.writeFileSync(path.join(__dirname, 'auth.json'), JSON.stringify(auth, null, 2));
  console.log('auth.json created in backend/, content:');
  console.log(JSON.stringify(auth, null, 2));
})();
