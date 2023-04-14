module.exports = ({ env }) => ({
  // apiToken: {
  //   salt: env('API_TOKEN_SALT', 'someRandomLongString'),
  // },
  // auditLogs: { // only accessible with an Enterprise plan
  //   enabled: env.bool('AUDIT_LOGS_ENABLED', true),
  // },
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecretKey'),
  },
  // transfer: {
  //   token: {
  //     salt: env('TRANSFER_TOKEN_SALT', 'anotherRandomLongString'),
  //   }
  // },
  autoOpen: false
});
