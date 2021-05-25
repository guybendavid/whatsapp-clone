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
  User: require("./user")(sequelize, Sequelize.DataTypes),
  Message: require("./message")(sequelize, Sequelize.DataTypes)
};

const { User, Message } = models;

User.hasMany(Message, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "recipientId" });
Message.belongsTo(User, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "recipientId" });

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export { sequelize, User, Message };