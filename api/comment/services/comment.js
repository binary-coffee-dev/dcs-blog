'use strict';

const crypto = require('crypto');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  createCaptchaJwt(text, key) {
    const head = Buffer.from(JSON.stringify({alg: "HS256", typ: "JWT"})).toString('base64');
    const body = Buffer.from(JSON.stringify({
      hash: this.createHash(text.toLowerCase(), key),
      exp: new Date().getTime() + 60000
    })).toString('base64');
    const sign = this.createHash(`${head}.${body}`, key);
    return `${head}.${body}.${sign}`;
  },

  checkCaptchaJwt(jwt, text, key) {
    const splitJwt = jwt.split('.');
    if (splitJwt.length === 3) {
      try {
        if (this.createHash(`${splitJwt[0]}.${splitJwt[1]}`, key) === splitJwt[2]) {
          const body = JSON.parse(Buffer.from(splitJwt[1], 'base64').toString());
          if (parseInt(body.exp) > new Date().getTime()) {
            return body.hash === this.createHash(text.toLowerCase(), key);
          }
        }
      } catch (ignore) {}
    }
    return false;
  },

  createHash(text, key) {
    return crypto.createHmac('sha256', key).update(text).digest('base64');
  },
};
