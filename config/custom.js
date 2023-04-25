module.exports = ({env}) => ({
  myCustomConfiguration: 'This configuration is accessible through strapi.config.myCustomConfiguration',

  captchaSecret: env('CAPTCHA_SECRET', 'captcha-secret'),

  apiUrl: env('API_URL', 'https://api.binary-coffee.dev'),
  siteUrl: env('SITE_URL', 'https://binary-coffee.dev'),

  feedArticlesLimit: env.int('FEED_ARTICLES_LIMIT', 15),

  maxPostRequestLimit: 20,
  maxSimilarPostRequestLimit: 20,
  maxNumberOfArticlesPerDay: 5,
  maxNumberOfCommentsPerDay: 20,
  maxRecentComments: 15,
  maxNumberOfUploadsPerDay: 10,
  maxNumberOfTopUsers: 5,

  googleClientId: env('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: env('GOOGLE_CLIENT_SECRET', ''),
  githubClientId: env('GITHUB_CLIENT_ID', ''),
  githubClientSecret: env('GITHUB_CLIENT_SECRET', ''),

  botNotifierUrl: env('BOT_NOTIFIER_URL', 'https://botnotifier.binary-coffee.dev/notify/channel'),

  podcastEspacioBinarioIdentifier: 'espacio-binario'
});
