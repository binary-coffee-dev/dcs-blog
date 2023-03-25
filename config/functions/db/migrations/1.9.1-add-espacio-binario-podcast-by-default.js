'use strict';

module.exports = {
  version: '1.9.1',
  description: 'Create the default values on the podcast collection (espacio-binario)',
  migrate: async () => {
    await strapi.models.podcast.create({name: 'Espacio Binario', identifier: 'espacio-binario'});
  },
};
