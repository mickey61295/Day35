const os = require('os')

console.log(os.platform())

console.log(os.release())

console.log(os.type())

console.log(os.hostname())

console.log(os.userInfo())

console.log(os.totalmem() / 1024 / 1024 / 1024)

console.log(os.freemem() / 1024 / 1024 / 1024)