module.exports = async function (strapi, user, post, type = 'like') {
  return strapi.models.opinion.create({user: user.id, post: post, type});
};
