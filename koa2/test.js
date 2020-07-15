const Keygrip = require('keygrip');

let keygrip = new Keygrip(['hello'], 'md5', 'base64')


const data = 'kjskdjkfjdjk'
let digest = keygrip.sign(data)
console.log(digest)

const result = keygrip.verify(data, digest)
console.log(result)

let keygrip_new = new Keygrip(['xixi', 'hello'], 'md5', 'base64')

const index = keygrip_new.index(data, digest);
console.log(index)