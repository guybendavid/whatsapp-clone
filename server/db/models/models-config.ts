import { getCreateMessageModel } from "#root/server/db/models/message";
import { getCreateUserModel } from "#root/server/db/models/user";
import config from "#root/server/db/config/config";
import Sequelize from "sequelize";

const { NODE_ENV } = process.env;
const environmentKey = NODE_ENV === "production" ? "production" : "development";
const environmentConfig = config[environmentKey];

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
