let ctx = {}

function delegateGetter(target, name) {
    Object.defineProperty(ctx, name, {
        get: function () {
            return this[target][name];
        }
    })
}

function delegateSetter(target, name) {
    Object.defineProperty(ctx, name, {
        set: function (value) {
            this[target][name] = value;
        }
    })
}

function delegateAccess(target, name) {
    Object.defineProperty(ctx, name, {
        get: function () {
            return this[target][name];
        },
        set: function (value) {
            this[target][name] = value;
        }
    })
}

function delegateMethod(target, name) {
    ctx[name] = function (...args) {
        return this[target][name].call(ctx, ...args)
    }
}

delegateAccess('request', 'url');
delegateAccess('request', 'method');

delegateAccess('response', 'body');

delegateMethod('request', 'get');


module.exports = ctx
