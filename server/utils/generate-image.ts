// using the module.exports syntax allowes the init-users file to use this function
module.exports = () => {
  return `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
};
