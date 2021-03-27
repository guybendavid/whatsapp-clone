import { Sequelize } from "sequelize";

export = (sequelize: Sequelize, DataTypes: any) => {
  const Message = sequelize.define("Message", {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sender_id",
      references: {
        key: "id",
        model: "users"
      }
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "recipient_id",
      references: {
        key: "id",
        model: "users"
      }
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: "Message",
    tableName: "messages",
    updatedAt: false,
    underscored: true
  });

  return Message;
};