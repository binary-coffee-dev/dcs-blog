'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  generateToken (size = 12) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    return new Array(size)
      .fill(undefined)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .reduce((prev, ch) => prev + ch, '');
  }
};
