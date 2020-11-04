/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const imageGenerator = require("../../utils/imageGenerator");
const bcrypt = require("bcrypt");
require("dotenv").config();

// eslint-disable-next-line no-undef
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hasedPassword = await bcrypt.hash(process.env.SEEDERS_PASSWORD, 6);
    await queryInterface.bulkInsert("users", [
      {
        first_name: "Guy",
        last_name: "Ben David",
        username: "guy",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "James",
        last_name: "Green",
        username: "james",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "John",
        last_name: "Smith",
        username: "john",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "David",
        last_name: "Johnson",
        username: "david",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Joe",
        last_name: "Stevens",
        username: "Joe",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Matthew",
        last_name: "Thomas",
        username: "matthew",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Andrew",
        last_name: "Brian",
        username: "andrew",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Ronald",
        last_name: "Nielsen",
        username: "ronald",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Alexander",
        last_name: "Williams",
        username: "alexander",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Chris",
        last_name: "Lopez",
        username: "chris",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Daniel",
        last_name: "Jones",
        username: "daniel",
        password: hasedPassword,
        image: imageGenerator()
      },
      {
        first_name: "Mike",
        last_name: "Lee",
        username: "mike",
        password: hasedPassword,
        image: imageGenerator()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  }
};