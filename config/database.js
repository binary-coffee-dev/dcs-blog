module.exports = ({env}) => ({
  defaultConnection: 'default',
  connections: {
    // default: {
    //   connector: 'mongoose',
    //   settings: {
    //     client: 'mongo',
    //     database: env('DATABASE_NAME', 'blog-dev'),
    //     host: env('DATABASE_HOST', '127.0.0.1'),
    //     port: env.int('DATABASE_PORT', 27018),
    //     username: env('DATABASE_USERNAME', ''),
    //     password: env('DATABASE_PASSWORD', ''),
    //   },
    //   options: {
    //     debug: false,
    //     useUnifiedTopology: true,
    //     useNewUrlParser: true
    //   },
    // }
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        database: 'blog',
        username: 'api',
        password: 'password',
        port: env.int('DATABASE_PORT', 3306),
        host: '127.0.0.1',
      },
      options: {},
    }
  }
});
