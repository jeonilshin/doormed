const bcrypt = require('bcryptjs')

// The hash you want to check
const hash = '$2a$10$T.KLL8.M2g0./kLrQdbogeMHvU8NDTI0pVBj.dAfw7zBjuvN53BTK'

// Common passwords to try
const commonPasswords = [
  'password',
  'password123',
  'admin',
  'admin123',
  '123456',
  '12345678',
  'qwerty',
  'test',
  'test123',
  'user',
  'user123',
  'rider',
  'rider123',
  'doormed',
  'doormed123'
]

console.log('Checking password hash...\n')

commonPasswords.forEach(password => {
  const isMatch = bcrypt.compareSync(password, hash)
  if (isMatch) {
    console.log(`✅ MATCH FOUND: "${password}"`)
  }
})

console.log('\nIf no match found, the password is not in the common list.')
console.log('You can add more passwords to try in the script.')
