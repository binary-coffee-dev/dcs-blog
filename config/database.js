module.exports = ({env}) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        database: env('DATABASE_NAME', 'blog'),
        username: env('DATABASE_USERNAME', 'api'),
        password: env('DATABASE_PASSWORD', 'password'),
        port: env.int('DATABASE_PORT', 3306),
        host: env('DATABASE_HOST', 'mysql')
      },
      options: {},
    }
  }
});
