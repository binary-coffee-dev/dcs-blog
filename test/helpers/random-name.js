module.exports = (value) => {
  return [...Array(value || 20).keys()]
    .map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)])
    .reduce((p, v) => p + v, '');
};
