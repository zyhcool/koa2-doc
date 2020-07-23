
function asyncTask() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success after 10ms')
        }, 10);
    })
}



function thunk(fn) {
    return function (...args) {
        return function (cb) {
            fn.call(null, ...args, cb)
        }
    }
}


var fs = require('fs');
var readFileThunk = thunk(fs.readFile);

var gen = function* () {
    var r1 = yield readFileThunk('./package.json');
    console.log(r1);
    var r2 = yield readFileThunk('./index.js');
    console.log(r2);
};


// let g = gen();
// let r1 = g.next('11')
// console.log('r1:', r1);
// let r2 = g.next('22')
// console.log('r2:', r2)
// let r3 = g.next('33')
// console.log('r3:', r3)


function run(gen) {
    let g = gen();
    function next(err, data) {
        let r = g.next(data);
        if (!r.done) {
            r.value(next)
        }
    }
    let r = g.next();
    r.value(next);
}

// run(gen)


function* gg() {
    console.log(1);
    let r1 = yield 1;
    console.log(r1)
    let r2 = yield 2 + 99;
    console.log('r2', r2);

    let r3 = yield 3;
    console.log(r3);
}
let g = gg();
console.log(g.next())
console.log(g.next())
console.log(g.next(222))
console.log(g.next())



