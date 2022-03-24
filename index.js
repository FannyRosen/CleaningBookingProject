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

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      formatDate: (time) => {
        const date = new Date(time);
        return date.toLocaleDateString();
      },
    },
  })
);

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

      const userData = { username, userId: newUser._id.toString() };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);

      res.redirect("/home");
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
      res.render("login", { error: "Wrong username or password" });
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
    date: req.body.date,
    time: req.body.time,
    bookedBy: res.locals.id,
  });

  await newBooking.save();

  res.redirect("/my-page/" + res.locals.id);
});

// Borde det va my-page/:id?
app.get("/my-page/:id", async (req, res) => {
  const bookings = await BookingsModel.find().lean();

  const userBookings = [];

  for (const item of bookings) {
    if (item.bookedBy == res.locals.id) {
      userBookings.push(item);
    }
  }

  res.render("my-page", { userBookings });
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
