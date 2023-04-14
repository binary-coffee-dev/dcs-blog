module.exports = ({env}) => ({
  host: env('HOST', '0.0.0.0'),
  port: 3021,
  cron: {
    enabled: false
  },
  // admin: {
  //   autoOpen: false,
  //   browser: false
  // }
});
