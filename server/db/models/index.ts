/* eslint-disable @typescript-eslint/no-var-requires */
import Sequelize from "sequelize";

const { NODE_ENV, DB, DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env;
let config;

if (NODE_ENV === "production") {
  config = {
    database: DB,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };
} else {
  config = require(__dirname + "/../config/config.js")["development"];
}

// @ts-ignore
const sequelize = new Sequelize(config);

const models: any = {
  User: require("./User")(sequelize, Sequelize.DataTypes),
  Message: require("./Message")(sequelize, Sequelize.DataTypes)
};

models.User.hasMany(models.Message, { foreignKey: "senderId" });
models.User.hasMany(models.Message, { foreignKey: "recipientId" });
models.Message.belongsTo(models.User, { foreignKey: "senderId" });
models.Message.belongsTo(models.User, { foreignKey: "recipientId" });

Object.keys(models).map(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

const { User, Message } = models;
export { sequelize, User, Message };