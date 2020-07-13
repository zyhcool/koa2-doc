let ctx = {

}

function delegateGetter(target, name) {
    ctx.__defineGetter__(name, function () {
        return this[target][name];
    })
}

function delegateSetter(target, name) {
    ctx.__defineSetter__(name, function (value) {
        this[target][name] = value;
    })
}

function delegateMethod(target, name) {
    ctx[name] = function (...args) {
        return this[target][name].call(ctx, ...args)
    }
}

delegateGetter('request', 'url');
delegateSetter('request', 'url');

delegateGetter('response', 'body');
delegateSetter('response', 'body');



module.exports = ctx
