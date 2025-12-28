require("dotenv").config();

const { DB, DB_USER, DB_PASSWORD, DB_PROD, DB_USER_PROD, DB_PASSWORD_PROD, DB_HOST_PROD } = process.env;
const dialect = "postgres";

module.exports = {
  development: {
    database: DB,
    username: DB_USER,
    password: DB_PASSWORD,
    dialect
  },
  production: {
    database: DB_PROD,
    username: DB_USER_PROD,
    password: DB_PASSWORD_PROD,
    host: DB_HOST_PROD,
    dialect,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
