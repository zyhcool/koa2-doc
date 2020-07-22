

let a = function* (ha) {
    yield 12;
    yield 34;
}
let b = function () { }
let ha = a();
console.log(ha.next())
console.log(ha.next())
console.log(ha.next())


console.log(a.constructor)
console.log(b.constructor.toString())