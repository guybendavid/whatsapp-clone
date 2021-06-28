const createUserMigration = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: "first_name"
      },
      lastName: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: "last_name"
      },
      username: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          isAlphanumeric: {
            msg: "Please enter a valid username"
          }
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING
      }
    });
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable("users");
  }
};

export default createUserMigration;