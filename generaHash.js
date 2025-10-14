const bcrypt = require('bcrypt');

const password = 'admin1234';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
