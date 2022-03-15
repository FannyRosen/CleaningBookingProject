require("dotenv").config();
require("./mongoose");

const express = require("express");
const exphbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
