# koa中使用的第三方包

## cookies & keygrip
[cookies](https://www.npmjs.com/package/cookies)
[keygrip](https://www.npmjs.com/package/keygrip)

koa中内置了cookie的处理函数，可以通过http响应头的方式让浏览器保存返回的cookie数据
```javascript 
const app = new Koa({
    keys: ['helloworld'],
    secure: true,
});

app.use(async (ctx, next) => {
    let cookie = ctx.cookies.get('mykey')
    if (!cookie) {
        ctx.cookies.set('mykey', digest, {
            domain: 'localhost',
            signed: true,
            path: '/',
            maxAge: 10 * 60 * 1000,
            expires: new Date('2020-8-15'),
            httpOnly: false,
            overwrite: false
        })
    }
    ctx.body = cookie;
    await next();
})
```
ctx对象上暴露的cookies，get方法可以读取请求头携带的cookie值，set方法可以设置响应头的set-cookie字段值，具体实现封装在cookie包导出的Cookies对象中

### 签名cookie
当设置cookies时使用`signed:true`，需要同时设置Koa实例的keys属性：由秘钥组成的数组
Cookies模块根据keys签发签名，签名的目的是为了保证cookie的安全性，保证不被篡改
此时的响应头有两个Set-Cookie字段：
![dsf](/public/set-cookie.png)

之后的请求头都会带上cookie字段，如：`mykey=vUhVi9CBHiRP1u+ymA60Jg==; mykey.sig=VGf3oXvPyPGSvyncLswMZ9ree3w`


### Keygrip
在介绍cookie包之前先介绍下keygrip包。Keygrip是一个封装函数，开放三个接口方法：sign、verify和index
```javascript
var compare = require('tsscmp')
var crypto = require("crypto")
  
function Keygrip(keys, algorithm, encoding) {
  if (!algorithm) algorithm = "sha1";
  if (!encoding) encoding = "base64";
  if (!(this instanceof Keygrip)) return new Keygrip(keys, algorithm, encoding)

  if (!keys || !(0 in keys)) {
    throw new Error("Keys must be provided.")
  }

  function sign(data, key) {
    return crypto
      .createHmac(algorithm, key)
      .update(data).digest(encoding)
      .replace(/\/|\+|=/g, function(x) {
        return ({ "/": "_", "+": "-", "=": "" })[x]
      })
  }

  this.sign = function(data){ return sign(data, keys[0]) }

  this.verify = function(data, digest) {
    return this.index(data, digest) > -1
  }

  this.index = function(data, digest) {
    for (var i = 0, l = keys.length; i < l; i++) {
      if (compare(digest, sign(data, keys[i]))) {
        return i
      }
    }

    return -1
  }
}

Keygrip.sign = Keygrip.verify = Keygrip.index = function() {
  throw new Error("Usage: require('keygrip')(<array-of-keys>)")
}

module.exports = Keygrip
```

sign方法使用crypto模块以keys数组第一个值为秘钥，实现生成数据的加盐摘要，并且替换掉摘要中对URL不友好的字符，默认使用sha1算法，默认编码为base64

index方法对keys数组循环，找到匹配原始数据和摘要的秘钥，若存在则返回秘钥在数组的索引，否则返回-1

veriry方法验证摘要与原始数据是否匹配，返回布尔值

keys是这个函数很重要的一个点，如果由于秘钥泄漏了或者其他原因需要更换秘钥，则在keys开头添加最新的秘钥，对keys循环检验其实是为了让之前签发的摘要兼容旧秘钥；index方法在这里起到的作用就是当返回值大于0，则说明更换了秘钥，这时就应该重新派发签名摘要，避免以后对服务器资源的浪费。

> index方法中，比对摘要和新生成摘要的方法是引用tsscmp包的timeSafeCompare方法，这种对数据的比对方法更加安全


### Cookies
cookies模块可以操作http中的cookie，获取请求头的cookie值，设置响应头的cookie

Cookies类的实例暴露get和set方法
```javascript 
Cookies.prototype.get = function (name, opts) {
  var sigName = name + ".sig"
    , header, match, value, remote, data, index
    , signed = opts && opts.signed !== undefined ? opts.signed : !!this.keys

  header = this.request.headers["cookie"]
  if (!header) return

  match = header.match(getPattern(name))
  if (!match) return

  value = match[1]
  if (!opts || !signed) return value

  remote = this.get(sigName)
  if (!remote) return

  data = name + "=" + value
  if (!this.keys) throw new Error('.keys required for signed cookies');
  index = this.keys.index(data, remote)

  if (index < 0) {
    this.set(sigName, null, { path: "/", signed: false })
  } else {
    index && this.set(sigName, this.keys.sign(data), { signed: false })
    return value
  }
};
```
get方法接收的第一个参数name是cookie格式中[key:value]的key，从请求头中获取cookie的值，通过正则表达式匹配出name对应的cookie值

`remote = this.get(sigName)`语句递归调用get方法，获取name+'.sig'的cookie值，这是当signed:true时额外设置的cookie值

第二个参数opts为可选参数，{signed:true}被传入时，说明需要获取的签名cookie，获取的cookie必须通过签名验证，否则返回undefined
```javascript
index = this.keys.index(data, remote)
if (index < 0) {
  this.set(sigName, null, { path: "/", signed: false })
}
```
上面源码片段中index<0说明cookie无法通过签名验证，故不返回任何值（等同返回undefined）



set方法设置响应头字段set-cookie，如果指定{signed: true}，则响应头多一条set-cookie数据，字段名为name+'.sig'，字段值为第一个cookie的加盐摘要
```javascript
if (opts && signed) {
    if (!this.keys) throw new Error('.keys required for signed cookies');
    cookie.value = this.keys.sign(cookie.toString())
    cookie.name += ".sig"
    pushCookie(headers, cookie)
}
```

Cookies类在向下封装Cookie类，每条Set-Cookie便是由Cookie实例实现
```javascript 
Cookie.prototype.toString = function () {
  return this.name + "=" + this.value
};
Cookie.prototype.toHeader = function () {
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
```
Cookie的属性name和value便是[key=value]，toHeader方法拼接出完整的Set-Cookie的值

初始化时接收的第三个参数attrs是与Cookies实例的set方法第三个参数opts一样：

maxAge: a number representing the milliseconds from Date.now() for expiry 从现在算起到cookie过期的毫秒时长

expires: a Date object indicating the cookie's expiration date (expires at the end of session by default). cookie过期的时间点，UTC时间格式

path: a string indicating the path of the cookie (/ by default). cookie的path，默认为 /

domain: a string indicating the domain of the cookie (no default). cookie有效的域名

secure: a boolean indicating whether the cookie is only to be sent over HTTPS (false by default for HTTP, true by default for HTTPS). Read more about this option below. 默认为false，适用于HTTP；使用HTTPS时设置为true

httpOnly: a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript (true by default). 设置为true，则js脚本无法读取cookie

sameSite: a boolean or string indicating whether the cookie is a "same site" cookie (false by default). This can be set to 'strict', 'lax', or true (which maps to 'strict').cookie的sameSite属性，用于防止CSRF（Cross Site Request Forgery, 跨站域请求伪造）

signed: a boolean indicating whether the cookie is to be signed (false by default). If this is true, another cookie of the same name with the .sig suffix appended will also be sent, with a 27-byte url-safe base64 SHA1 value representing the hash of cookie-name=cookie-value against the first Keygrip key. This signature key is used to detect tampering the next time a cookie is received.指定cookie是否为签名cookie，若为true，则多一条以.sig为后缀的cookie

overwrite: a boolean indicating whether to overwrite previously set cookies of the same name (false by default). If this is true, all cookies set during the same request with the same name (regardless of path or domain) are filtered out of the Set-Cookie header when setting this cookie.是否覆盖之前设置的同名cookie




### 简单实现Cookies和Keygrip
#### Keygrip
首先实现Keygrip：
1. sign方法使用注册中的第一个秘钥生成签名
2. verify方法验证数据合法性
3. index方法找到数据所匹配的私钥索引

```javascript
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
```

#### Cookies
1. get方法获取cookie值（难点：需进行正则匹配）
2. set方法设置响应头的Set-Cookie
3. Cookie类实现单条cookie的操作

```javascript
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

```

























































