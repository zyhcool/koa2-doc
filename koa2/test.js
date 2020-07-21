const util = require('util')

let a = {
    [util.inspect.custom]() {
        console.log('hello')
    },
    name: 'zyh',
}

util.inspect(a)



