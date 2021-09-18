type ArrayItem = string | boolean | undefined;
const classNamesGenerator = (...items: ArrayItem[]) => [...items].filter(string => string).join(' ');
export default classNamesGenerator;