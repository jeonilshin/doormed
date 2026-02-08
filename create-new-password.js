// Script to create a new password hash
const bcrypt = require('bcryptjs')

const password = process.argv[2] || 'admin123'

console.log('🔐 Creating password hash...\n')
console.log(`Password: "${password}"`)

const hash = bcrypt.hashSync(password, 12)

console.log(`\nHash: ${hash}`)
console.log('\n📝 To update your admin password:')
console.log('1. Open Prisma Studio: npx prisma studio')
console.log('2. Go to User table')
console.log('3. Find jeonilshinbusiness@gmail.com')
console.log('4. Update the password field with the hash above')
console.log('5. Save')
console.log(`6. Login with: jeonilshinbusiness@gmail.com / ${password}`)
