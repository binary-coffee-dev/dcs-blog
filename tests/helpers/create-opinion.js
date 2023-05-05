module.exports = async function (strapi, user, post, type = 'like') {
  return strapi.models.opinion.create({data: {user: user.id, post: post, type}});
};
