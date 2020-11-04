/* eslint-disable no-undef */
const imageGenerator = () => {
  return `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
};

module.exports = imageGenerator;