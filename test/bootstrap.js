/* eslint-disable */
const strapi = require('strapi');

before(function (done) {
  // strapi.start({}, function(err) {
  //   if (err) {
  //     return done(err);
  //   }
  //
  //   done(err, strapi);
  // });
  done();
});

after(function (done) {
  // strapi.stop(done());
  done();
});
