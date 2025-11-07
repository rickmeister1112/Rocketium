const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const url = process.env.MONGO_URI ?? 'mongodb://localhost:27017/rocketium';

/** @type {import('migrate-mongo').MigrateMongoConfig} */
module.exports = {
  mongodb: {
    url,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'migration_changelog',
  migrationFileExtension: '.js',
};

