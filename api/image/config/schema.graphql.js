module.exports = {
  resolver: {
    Query: {
      imagesConnection: {
        resolver: 'application::image.image.findExtra',
      }
    }
  }
};
