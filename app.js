require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

if (process.env.NODE === "DEVELOPMENT") {
  app.use(morgan("dev"));
}

// Routes
const authRoute = require("./routes/authRoute");
const categoryRoute = require("./routes/categoryRoute");
const hotelRoute = require("./routes/hotelRoute");
const roomRoute = require("./routes/roomRoute");
const customerRoute = require("./routes/customerRoute");
const reviewRoute = require("./routes/reviewRoute");
const bookingRoute = require("./routes/bookingRoute");
const notificationRoute = require("./routes/notificationRoute");

// Middlewares
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

app.use(express.json());
app.use(cookieParser(process.env.JWT_TOKEN_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/hotel", hotelRoute);
app.use("/api/v1/room", roomRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/booking", bookingRoute);
app.use("/api/v1/notification", notificationRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
