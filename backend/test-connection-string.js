require('dotenv').config();

console.log('🔍 Connection String Debug:');
console.log('Full connection string:');
console.log(
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
);

console.log('\n🔍 Individual components:');
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '***HIDDEN***' : 'NOT SET');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_DATABASE);
