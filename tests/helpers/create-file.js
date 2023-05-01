const randomName = require('./random-name');

module.exports = async function (strapi, user) {
  let file = await strapi.query('plugin::upload.file').create({
    data: {
      name: `${randomName()}.png`,
      sha256: 'eqn5SJmX-C0Z7d6y33vQf1E8dqfHne42PyUV4LAXSkM',
      hash: 'aa1a1c876ac249e9b77ab0960156be54',
      ext: '.png',
      mime: 'image/png',
      size: 128.86,
      url: '/uploads/aa1a1c876ac249e9b77ab0960156be54.png',
      provider: 'local',
      related: []
    }
  });
  file = await strapi.query('plugin::upload.file').findOne({where: {id: file.id}, populate: ['related']});
  await strapi.query(file.related[0].__type).update({where: {id: file.related[0].id}, data: {user: user.id}});
  const image = await strapi.query(file.related[0].__type).findOne({where: {id: file.related[0].id}});
  return {image, file};
};
