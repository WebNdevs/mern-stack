import bcrypt from 'bcrypt';

// Example stored hashed password (you would usually get this from your database)
const hashedPassword = '$2b$08$IBkXO8W2oGKrQJuqUhkw2uQUiv82xNEBci68u4tAeqP7yh1YhDXiG';

// The password you want to check
const passwordToCheck = 'password';

// Compare the provided password with the stored hashed password
const ismatch = await bcrypt.compare(passwordToCheck, hashedPassword,);

console.log(ismatch)