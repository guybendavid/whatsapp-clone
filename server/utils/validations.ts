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

  if (emptyFields.length > 0) {
    errors = formatMessage("please send a non empty value for the field", emptyFields);
  }

  if (sideWhiteSpacesFields.length > 0) {
    const message = formatMessage("please remove side white-spaces from the field", sideWhiteSpacesFields);
    const isPreviousErrors = errors.length > 0;
    errors += isPreviousErrors ? `<br /> ${message}` : message;
  }

  return errors;
};

const isOnlyOneField = (fields: string[]) => getInvalidFields(fields).length === 1;

// Template literals add a comma to the returned array from a map by default, so only needed to add a space
const getInvalidFields = (fields: string[]) => fields.map((field, index) => `${index > 0 ? ` ${field}` : field}`);

const formatMessage = (message: string, fields: string[]) =>
  `${message += isOnlyOneField(fields) ? ":" : "s:"} ${getInvalidFields(fields)}`;

export { getErrors };