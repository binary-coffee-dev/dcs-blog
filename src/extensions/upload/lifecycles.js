module.exports = (plugin) => {
  const oldBootstrap = plugin.bootstrap;
  plugin.bootstrap = (ctx) => {
    oldBootstrap(ctx);
    const {strapi} = ctx;

    const ser = strapi.service('plugin::upload.upload');
    const oldFormatFunction = ser.formatFileInfo;
    ser.formatFileInfo = async function(file, fileInfo, metas) {
      try {
        const obj = JSON.parse(file.filename);
        fileInfo.caption = obj.userId;
        file.filename = obj.name;
      } catch (ignore) {
        // used to pass over the user id to the image
      }
      return oldFormatFunction(file, fileInfo, metas);
    };

    strapi.db.lifecycles.subscribe({
      // models: [],
      beforeCreate(event) {
        const {model} = event;
        if (model.uid === 'plugin::upload.file') {
          const {state} = event;
          const {data} = event.params;
          state.userId = data.caption;
        }
      },

      async afterCreate(event) {
        const {model} = event;
        if (model.uid === 'plugin::upload.file') {
          const {result, state} = event;
          await strapi.query('api::image.image').create({
            data: {
              image: result.id,
              user: state.userId
            }
          });
        }
      },

      async beforeDelete(event) {
        const {params, model, state} = event;
        if (model.uid === 'plugin::upload.file') {
          const {where} = params;
          const uploadFile = await strapi.query('plugin::upload.file').findOne({where, populate: ['related']});
          state.toRemoveList = uploadFile.related;
        }
      },

      async afterDelete(event) {
        const {model, state} = event;
        if (model.uid === 'plugin::upload.file') {
          const {toRemoveList} = state;
          if (toRemoveList && toRemoveList.length) {
            for (let el of toRemoveList) {
              await strapi.query(el.__type).deleteMany({where: {id: el.id}});
            }
          }
        }
      }
    });
  };
};
