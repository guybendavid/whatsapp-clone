import { getCreateMessageModel } from "./message";
import { getCreateUserModel } from "./user";
import config from "../config/config";
import Sequelize from "sequelize";

const { NODE_ENV } = process.env;
const environmentConfig = config[NODE_ENV === "production" ? "production" : "development"];

// @ts-expect-error - Config file is JavaScript
export const sequelize = new Sequelize(environmentConfig);

const models: any = {
  User: getCreateUserModel({ sequelize, DataTypes: Sequelize.DataTypes }),
  Message: getCreateMessageModel({ sequelize, DataTypes: Sequelize.DataTypes })
};

export const { User, Message } = models;

User.hasMany(Message, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "recipientId" });
Message.belongsTo(User, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "recipientId" });

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
