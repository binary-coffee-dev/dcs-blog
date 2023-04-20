module.exports = ({env}) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'sqlite',
        filename: env('DATABASE_FILENAME', './data/data.db'), // or specify the path to your db file
        migrations: {
          directory: './migrations',
          tableName: 'migrations'
        }
      },
      options: {
        useNullAsDefault: true,
      },
    }
  }
});
