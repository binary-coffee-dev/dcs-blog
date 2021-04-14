'use strict';

/**
 * `disable` policy.
 */

module.exports = async (ctx) => {
  ctx.forbidden('Not allowed');
  new Error('Not allowed');
};
