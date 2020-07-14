let response = {
    get body() {
        return this._body;
    },
    set body(value) {
        this._body = value;
        if (typeof value == null) {
            this.res.removeHeader('Content-Type');
            this.res.removeHeader('Content-Length');
            this.res.removeHeader('Transfer-Encoding');
            return;
        }
    }
}

module.exports = response
