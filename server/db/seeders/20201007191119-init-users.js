/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require("bcrypt");
const generateImage = require("../../utils/generate-image.ts");
require("dotenv").config();

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    const hasedPassword = await bcrypt.hash(process.env.SEEDERS_PASSWORD, 6);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          first_name: "Guy",
          last_name: "Ben David",
          username: "guy",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "David",
          last_name: "De Gea",
          username: "david",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Aaron",
          last_name: "Wan Bissaka",
          username: "aaron",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Harry",
          last_name: "Maguire",
          username: "harry",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Victor",
          last_name: "Lindelof",
          username: "victor",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Luke",
          last_name: "Shaw",
          username: "luke",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Fred",
          last_name: "Rodrigues",
          username: "fred",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Scott",
          last_name: "Mctominay",
          username: "scott",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Nemanja",
          last_name: "Matic",
          username: "nemanja",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Donny",
          last_name: "Van De Beek",
          username: "donny",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Paul",
          last_name: "Pogba",
          username: "paul",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Bruno",
          last_name: "Fernandes",
          username: "bruno",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Marcus",
          last_name: "Rashford",
          username: "marcus",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Mason",
          last_name: "Greenwood",
          username: "mason",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Anthony",
          last_name: "Martial",
          username: "anthony",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Edinson",
          last_name: "Cavani",
          username: "edinson",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Eric",
          last_name: "Bailly",
          username: "eric",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Axel",
          last_name: "Tuanzebe",
          username: "axel",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Brandon",
          last_name: "Williams",
          username: "brandon",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Daniel",
          last_name: "James",
          username: "daniel",
          password: hasedPassword,
          image: generateImage()
        },
        {
          first_name: "Juan",
          last_name: "Mata",
          username: "juan",
          password: hasedPassword,
          image: generateImage()
        }
      ],
      {}
    );
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  }
};
