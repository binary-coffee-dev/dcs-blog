module.exports = ({env}) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', 'mysql'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'news'),
      user: env('DATABASE_USERNAME', 'api'),
      password: env('DATABASE_PASSWORD', 'password'),
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },
    debug: false,
  },
});
