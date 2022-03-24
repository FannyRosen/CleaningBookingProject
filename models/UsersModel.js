const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
});

const UsersModel = mongoose.model("Users", userSchema);

module.exports = UsersModel;
