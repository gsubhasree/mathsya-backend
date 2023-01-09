var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var session = require("express-session");
var cors = require("cors");
const redisClient = require("./utils/redis");

const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URL;
mongoose.set("strictQuery", false);

mongoose.connect(mongoUrl, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

var redisStore = require("connect-redis")(session);

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");

const passport = require("passport");

var app = express();

app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
  })
);

app.use(
  session({
    store: new redisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport")(passport);

app.use("/auth", authRouter);
app.use("/", indexRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
