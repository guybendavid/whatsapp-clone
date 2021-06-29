import { Message, User } from "../db/interfaces/interfaces";

const getErrors = (payload: User | Message) => {
  let errors = "";
  const emptyFields: string[] = [];
  const sideWhiteSpacesFields: string[] = [];

  // This RegEx will disallow white-space at the beginning and at the end
  const validString = /^[^\s]+(\s+[^\s]+)*$/;

  Object.entries(payload).forEach(([key, value]) => {
    if (!value || !validString.test(value)) {
      !value ? emptyFields.push(key) : sideWhiteSpacesFields.push(key);
    }
  });

  // Template literals add a comma to the returned array using a map by default, so it's only needed to add a space
  const getInvalidFields = (fields: string[]) => fields.map((field, index) => `${index > 0 ? ` ${field}` : field}`);
  const isOnlyOneField = (fields: string[]) => getInvalidFields(fields).length === 1;

  const getFormattedMessage = (message: string, fields: string[]) =>
    `${message += isOnlyOneField(fields) ? ":" : "s:"} ${getInvalidFields(fields)}`;

  if (emptyFields.length > 0) {
    errors = getFormattedMessage("please send a non empty value for the field", emptyFields);
  }

  if (sideWhiteSpacesFields.length > 0) {
    const message = getFormattedMessage("please remove side white-spaces from the field", sideWhiteSpacesFields);
    const isPreviousErrors = errors.length > 0;
    isPreviousErrors ? errors += `<br /> ${message}` : errors = message;
  }

  return errors;
};

export { getErrors };