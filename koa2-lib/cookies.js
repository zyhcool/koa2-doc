const { Cookie } = require("cookies");


class Cookies {
    constructor(request, response, options) {
        this.request = request;
        this.response = response;
        if (options) {
            this.keys = new Keygrip(options.keys);
            this.secure = options.secure;
        }
    }
    get(name, opts) {
        let header = this.request.headers["cookie"];
        let match = header.match(new RegExp(
            "(?:^|;) *" +
            name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
            "=([^;]*)")
        );
        if (opts && opts.signed) {
            const sigName = name + 'sig';
            const data = name + '=' + match[1];
            let sig = this.get(sigName);
            let index = this.keys.index(data, sig);
            // 如果index大于0，说明签名使用的秘钥是过期的秘钥，需要更新签名
            if (index > 0) {
                this.set(sigName, this.keys.sign(data), { signed: false })
            }
        }
        return match[1];
    }
    set(name, value, opts) {
        const headers = this.response.getHeader('Set-Cookie')
        let cookie = new Cookie(name, value, opts);
        this.pushCookie(headers, cookie);
        if (opts && opts.signed) {
            cookie.value = this.keys.sign(cookie.toString())
            cookie.name += ".sig"
            pushCookie(headers, cookie)
        }
        this.response.setHeader("Set-Cookie", headers);
        return this;
    }

    pushCookie(headers, cookie) {
        if (cookie.overwrite) {
            for (var i = headers.length - 1; i >= 0; i--) {
                if (headers[i].indexOf(cookie.name + '=') === 0) {
                    headers.splice(i, 1)
                }
            }
        }

        headers.push(cookie.toHeader())
    }
}

class Cookie {
    constructor(name, value, opts) {
        this.name = name;
        this.value = value;
        this.path = "/";
        this.expires = undefined;
        this.domain = undefined;
        this.httpOnly = true;
        this.sameSite = false;
        this.secure = false;
        this.overwrite = false;
        for (let key in opts) {
            this[key] = opts[key];
        }
    }
    toString() {
        return this.name + "=" + this.value
    };
    toHeader() {
        var header = this.toString()

        if (this.maxAge) this.expires = new Date(Date.now() + this.maxAge);

        if (this.path) header += "; path=" + this.path
        if (this.expires) header += "; expires=" + this.expires.toUTCString()
        if (this.domain) header += "; domain=" + this.domain
        if (this.sameSite) header += "; samesite=" + (this.sameSite === true ? 'strict' : this.sameSite.toLowerCase())
        if (this.secure) header += "; secure"
        if (this.httpOnly) header += "; httponly"

        return header
    };
}







