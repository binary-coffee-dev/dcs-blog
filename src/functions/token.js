module.exports = {
  generate: (size = 12) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    return new Array(size)
      .fill(undefined)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .reduce((prev, ch) => prev + ch, '');
  },
};
