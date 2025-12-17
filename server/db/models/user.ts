import { Sequelize } from "sequelize";

export const getCreateUserModel = ({ sequelize, DataTypes }: { sequelize: Sequelize; DataTypes: any }) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "first_name"
      },
      lastName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "last_name"
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          isAlphanumeric: {
            msg: "Please enter a valid username"
          }
        }
      },
      password: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      image: {
        type: DataTypes.STRING
      }
    },
    {
      modelName: "User",
      tableName: "users",
      timestamps: false
    }
  );

  return User;
};
