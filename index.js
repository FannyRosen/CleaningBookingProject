require("dotenv").config();
require("./mongoose.js");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const UsersModel = require("./models/UsersModel.js");
const BookingsModel = require("./models/BookingsModel.js");
const utils = require("./utils.js");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.engine("hbs", exphbs.engine({ extname: ".hbs", defaultLayout: "main" }));

app.set("view engine", "hbs");

app.use(express.static("public"));

app.use(cookieParser());

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

app.get("/", (req, res) => {
  res.render("register");
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

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      const userData = { username, userId: user._id.toString() };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/home");
    } else {
      res.render("/login", { error: "Wrong username or password" });
    }
  });
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/home", async (req, res) => {
  const newBooking = new BookingsModel({
    cleanerName: req.body.cleanerName,
    service: req.body.service,
    date: parseInt(new Date().toLocaleString()),
  });

  await newBooking.save();

  res.redirect("/my-page");
});

// Borde det va my-page/:id?
app.get("/my-page", (req, res) => {
  // const bookings = BookingsModel.find().lean()

  const usersBookings = [];

  // bookings.forEach((item) => {
  //   if (item.customer === res.locals.id) usersBookings.push(item);
  // });

  res.render("my-page", usersBookings);
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

app.use("/", (req, res) => {
  res.status(404).render("not-found");
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
