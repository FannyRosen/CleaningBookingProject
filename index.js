require("dotenv").config();
require("./mongoose");

const express = require("express");
const exphbs = require("express-handlebars");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

const UsersModel = require("./models/UsersModel.js");
const utils = require("./utils");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.engine("hbs", exphbs.engine({ extname: ".hbs", defaultLayout: "main" }));

app.set("view engine", "hbs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      return res.status(400).render("home", {
        error: "Användarnamnet är upptaget.",
      });
    } else if (password !== confirmPassword) {
      return res.status(400).render("home", {
        error: "Lösenorden matchar inte, vänligen försök igen.",
      });
    } else {
      const newUser = new UsersModel({
        username,
        hashedPassword: utils.hashPassword(password),
      });

      await newUser.save();

      res.sendStatus(200);
    }
  });
});

app.use("/", (req, res) => {
  res.status(404).render("not-found");
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
