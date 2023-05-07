'use strict';

const allowedUpdateFields = new Set(['page']);

module.exports = async (ctx) => {
  const {data} = ctx.args;
  const keys = Object.keys(data);
  keys.filter(k => !allowedUpdateFields.has(k)).forEach(k => delete data[k]);
  return true;
};
