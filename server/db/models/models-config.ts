import Sequelize from "sequelize";
import user from "./user";
import message from "./message";
// @ts-ignore
import * as config from "../config/config";

const { NODE_ENV } = process.env;
const environmentConfig = config[NODE_ENV === "production" ? "production" : "development"];

// @ts-ignore
const sequelize = new Sequelize(environmentConfig);

const models: any = {
  User: user(sequelize, Sequelize.DataTypes),
  Message: message(sequelize, Sequelize.DataTypes)
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