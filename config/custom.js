module.exports = ({env}) => ({
  myCustomConfiguration: 'This configuration is accessible through strapi.config.myCustomConfiguration',

  captchaSecret: env('CAPTCHA_SECRET', 'captcha-secret'),

  apiUrl: env('API_URL', 'https://api.binary-coffee.dev'),
  siteUrl: env('SITE_URL', 'https://binary-coffee.dev'),

  googleClientId: env('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: env('GOOGLE_CLIENT_SECRET', ''),
  githubClientId: env('GOOGLE_CLIENT_ID', ''),
  githubClientSecret: env('GOOGLE_CLIENT_SECRET', ''),

  botNotifierUrl: env('BOT_NOTIFIER_URL', 'https://botnotifier.binary-coffee.dev/notify/channel')
});
