module.exports = ({env}) => ({
  apiUrl: env('API_URL', 'https://api.binarycoffee.dev'),
  siteUrl: env('SITE_URL', 'https://binarycoffee.dev'),

  enableBotNotifications: true,
  botNotificationToken: env('BOT_NOTIFICATION_TOKEN', 'bot_token'),
  botNotifierUrl: env('BOT_NOTIFIER_URL', 'https://monitor.binarycoffee.dev/notification'),

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

  podcastEspacioBinarioIdentifier: 'espacio-binario'
});
