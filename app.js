var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var session = require("express-session");
var cors = require("cors");
const redisClient = require("./utils/redis");
const { consumer } = require("./kafka/location-consumer/index");

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
var productRouter = require("./routes/product");
var auctionRouter = require("./routes/auction");
var searchRouter = require("./routes/search");
var getClimateRouter = require("./routes/getClimate");
var getCoordinateClimateRouter = require("./routes/getCoordinateClimate");
var predictfishRouter = require("./routes/predictfish");

const passport = require("passport");
const { processData } = require("./utils/process-consumer-data");

var app = express();

const httpserver = require("http").createServer(app);
const io = require("socket.io")(httpserver, {
  cors: {
    origin: process.env.FRONTEND,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const mapOfVehicles = {};

consumer
  .on("ready", () => {
    console.log("consumer ready..");
    consumer.subscribe(["tracking"]);
    consumer.consume();
  })
  .on("data", function (data) {
    console.log("data received");
    try {
      processData(data.value.toString(), mapOfVehicles);
    } catch (e) {
      console.log(e);
    }
  });

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

app.use("/climate", getClimateRouter);
app.use("/climate", getCoordinateClimateRouter);
app.use("/globalfence", searchRouter);
app.use("/product", productRouter);
app.use("/predictfish", predictfishRouter);
app.use("/auth", authRouter);
app.use("/auction", auctionRouter);
app.use("/", indexRouter);

setInterval(() => {
  if (Object.keys(mapOfVehicles).length) io.emit("event", mapOfVehicles);
}, 1000);

module.exports = httpserver;
