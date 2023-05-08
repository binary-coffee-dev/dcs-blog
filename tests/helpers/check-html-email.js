module.exports = (html) => {
  return (html.match(/id="__article_item"/g) || []).length;
};
