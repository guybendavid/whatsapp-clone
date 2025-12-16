// using the module.exports syntax allowes the init-users file to use this function
// To do: try converting to ES module syntax
module.exports = () => `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
