module.exports = ({env}) => ({
  timeout: 100,
  load: {
    before: ['responseTime', 'logger', 'cors', 'responses', 'gzip'],
    order: [
      'Define the middlewares\' load order by putting their name in this array is the right order',
    ],
    after: ['parser', 'router'],
  },
  settings: {
    public: {
      path: './public',
      maxAge: 60000,
    },
    favicon: {
      path: './favicon.png',
      maxAge: 86400000
    },
    session: {
      enabled: true,
      client: 'cookie',
      key: 'strapi.sid',
      prefix: 'strapi:sess:',
      secretKeys: [env('SECRET1', 'mySecretKey1'), env('SECRET2', 'mySecretKey2')],
      httpOnly: true,
      maxAge: 86400000,
      overwrite: true,
      signed: false,
      rolling: false
    },
    logger: {
      level: 'debug',
      exposeInContext: true,
      requests: true
    },
    parser: {
      enabled: true,
      multipart: true
    },
    gzip: {
      enabled: true
    },
    responseTime: {
      enabled: false
    },
    poweredBy: {
      enabled: true,
      value: 'Binary Coffee <strapi.io>'
    },
    csp: {
      enabled: true
    },
    p3p: {
      enabled: true,
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true
    },
    xframe: {
      enabled: true,
      value: 'SAMEORIGIN'
    },
    xss: {
      enabled: true,
    },
    cors: {
      enabled: env.bool('CORS', true),
      origin: env('ORIGINS', 'https://www.binary-coffee.dev, https://binary-coffee.dev, https://api.binary-coffee.dev')
    },
    ip: {
      enabled: false,
      whiteList: [],
      blackList: []
    }
  },
});
