module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  {name: 'strapi::poweredBy', config: {poweredBy: 'Binary Coffee <strapi.io>'}},
  // 'strapi::logger',
  'strapi::query',
  'strapi::body',
  {name: 'strapi::session', config: {signed: false}},
  {name: 'strapi::favicon', config: {path: './favicon.png'}},
  'strapi::public',
];
