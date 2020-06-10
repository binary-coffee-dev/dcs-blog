const randomName = require('./random-name');

module.exports = async function (strapi, user) {
  const file = await strapi.plugins.upload.models.file.create({
      name: `${randomName()}.png`,
      sha256: "eqn5SJmX-C0Z7d6y33vQf1E8dqfHne42PyUV4LAXSkM",
      hash: "aa1a1c876ac249e9b77ab0960156be54",
      ext: ".png",
      mime: "image/png",
      size: 128.86,
      url: "/uploads/aa1a1c876ac249e9b77ab0960156be54.png",
      provider: "local",
      related: []
    }
  );
  const image = await strapi.services.image.create({image: [file.id], user: user.id});
  return {image, file};
};
