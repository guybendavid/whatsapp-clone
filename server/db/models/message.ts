import { Sequelize } from "sequelize";

export default (sequelize: Sequelize, DataTypes: any) => {
  const Message = sequelize.define(
    "Message",
    {
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
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at"
      }
    },
    {
      modelName: "Message",
      tableName: "messages",
      updatedAt: false
    }
  );

  return Message;
};
