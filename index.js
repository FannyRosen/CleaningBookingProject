require("dotenv").config();
require("./mongoose");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const UsersModel = require("./models/UsersModel.js");
const utils = require("./utils");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.engine("hbs", exphbs.engine({ extname: ".hbs", defaultLayout: "main" }));

app.set("view engine", "hbs");

app.use(express.static("public"));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("register");
});

app.use((req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);

    res.locals.loggedIn = true;
    res.locals.username = tokenData.username;
    res.locals.id = tokenData.userId;
  } else {
    res.locals.loggedIn = false;
  }
  next();
});

app.post("/", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      return res.status(400).render("register", {
        error: "Användarnamnet är upptaget.",
      });
    } else if (password !== confirmPassword) {
      return res.status(400).render("register", {
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log(password, username);

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      const userData = { username, userId: user._id.toString() };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    } else {
      res.render("/login", { error: "Wrong username or password" });
    }
  });
app.post("/logout", async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

app.use("/", (req, res) => {
  res.status(404).render("not-found");
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
