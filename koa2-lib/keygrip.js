const crypto = require('crypto');

class Keygrip {
    constructor(keys, algorithm, encoding) {
        this.keys = keys;
        this.algorithm = algorithm || 'sha1';
        this.encoding = encoding || 'base64';
    }
    sign(data, key) {
        key = key || this.keys[0];
        return crypto
            .createHmac(this.algorithm, key)
            .update(data)
            .digest(this.encoding);
    }
    verify(data, digest) {
        return this.index(data, digest) > -1;
    }
    index(data, digest) {
        for (var i = 0, l = this.keys.length; i < l; i++) {
            if (digest === this.sign(data, keys[i])) {
                return i
            }
        }
        return -1
    }
}
module.exports = Keygrip;