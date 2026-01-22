import { db } from "./connection";
import { users } from "./schema";
import bcrypt from "bcrypt";
import "dotenv/config";
import generateImage from "../utils/generate-image";

const seedUsers = async () => {
  const seedersPassword = process.env.SEEDERS_PASSWORD || "";

  if (!seedersPassword) {
    throw new Error("SEEDERS_PASSWORD is missing");
  }

  const hashedPassword = await bcrypt.hash(seedersPassword, 6);

  await db.insert(users).values([
    {
      firstName: "Guy",
      lastName: "Ben David",
      username: "guy",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "David",
      lastName: "De Gea",
      username: "david",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Aaron",
      lastName: "Wan Bissaka",
      username: "aaron",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Harry",
      lastName: "Maguire",
      username: "harry",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Victor",
      lastName: "Lindelof",
      username: "victor",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Luke",
      lastName: "Shaw",
      username: "luke",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Fred",
      lastName: "Rodrigues",
      username: "fred",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Scott",
      lastName: "Mctominay",
      username: "scott",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Nemanja",
      lastName: "Matic",
      username: "nemanja",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Donny",
      lastName: "Van De Beek",
      username: "donny",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Paul",
      lastName: "Pogba",
      username: "paul",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Bruno",
      lastName: "Fernandes",
      username: "bruno",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Marcus",
      lastName: "Rashford",
      username: "marcus",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Mason",
      lastName: "Greenwood",
      username: "mason",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Anthony",
      lastName: "Martial",
      username: "anthony",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Edinson",
      lastName: "Cavani",
      username: "edinson",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Eric",
      lastName: "Bailly",
      username: "eric",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Axel",
      lastName: "Tuanzebe",
      username: "axel",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Brandon",
      lastName: "Williams",
      username: "brandon",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Daniel",
      lastName: "James",
      username: "daniel",
      password: hashedPassword,
      image: generateImage()
    },
    {
      firstName: "Juan",
      lastName: "Mata",
      username: "juan",
      password: hashedPassword,
      image: generateImage()
    }
  ]);
};

seedUsers()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
