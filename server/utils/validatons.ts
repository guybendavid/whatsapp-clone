import { Message, User } from "../db/interfaces/interfaces";

const validateRegisterObj = ({ firstName, lastName, username, password }: User) => {
  const errors = [];

  if (!firstName) {
    errors.push("First Name must not be empty");
  }

  if (!lastName) {
    errors.push("Last Name must not be empty");
  }

  if (!username) {
    errors.push("Username must not be empty");
  }

  if (!password) {
    errors.push("Password must not empty");
  }

  return { errors, isValid: errors.length === 0 };
};

const validateLoginObj = ({ username, password }: User) => {
  const errors = [];

  if (!username) {
    errors.push("Username must not be empty");
  }

  if (!password) {
    errors.push("Password must not empty");
  }

  return { errors, isValid: errors.length === 0 };
};

const validateMessageObj = ({ recipientId, content }: Message) => {
  const errors = [];

  if (!recipientId) {
    errors.push("RecipientId must not be empty");
  }

  if (!content) {
    errors.push("Content must not empty");
  }

  return { errors, isValid: errors.length === 0 };
};

export { validateLoginObj, validateRegisterObj, validateMessageObj };