const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  const hash = bcrypt.hashSync(password, 8);
  return hash;
};

const comparePassword = (password, hash) => {
  const correct = bcrypt.compareSync(password, hash);
  return correct;
};

module.exports = {
  hashPassword,
  comparePassword,
};
