import { db } from "#root/server/db/connection";
import { users } from "#root/server/db/schema";
import { getGeneratedImage } from "#root/server/utils/generate-image";
import bcrypt from "bcrypt";
import "dotenv/config";

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
      image: getGeneratedImage()
    },
    {
      firstName: "David",
      lastName: "De Gea",
      username: "david",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Aaron",
      lastName: "Wan Bissaka",
      username: "aaron",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Harry",
      lastName: "Maguire",
      username: "harry",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Victor",
      lastName: "Lindelof",
      username: "victor",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Luke",
      lastName: "Shaw",
      username: "luke",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Fred",
      lastName: "Rodrigues",
      username: "fred",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Scott",
      lastName: "Mctominay",
      username: "scott",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Nemanja",
      lastName: "Matic",
      username: "nemanja",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Donny",
      lastName: "Van De Beek",
      username: "donny",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Paul",
      lastName: "Pogba",
      username: "paul",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Bruno",
      lastName: "Fernandes",
      username: "bruno",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Marcus",
      lastName: "Rashford",
      username: "marcus",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Mason",
      lastName: "Greenwood",
      username: "mason",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Anthony",
      lastName: "Martial",
      username: "anthony",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Edinson",
      lastName: "Cavani",
      username: "edinson",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Eric",
      lastName: "Bailly",
      username: "eric",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Axel",
      lastName: "Tuanzebe",
      username: "axel",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Brandon",
      lastName: "Williams",
      username: "brandon",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Daniel",
      lastName: "James",
      username: "daniel",
      password: hashedPassword,
      image: getGeneratedImage()
    },
    {
      firstName: "Juan",
      lastName: "Mata",
      username: "juan",
      password: hashedPassword,
      image: getGeneratedImage()
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
