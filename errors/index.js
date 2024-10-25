const CustomAPIError = require("./customError-api");
const BadRequestError = require("./bad-request");
const NotFoundError = require("./not-found");
const Unauthenticated = require("./unauthenticated");
const Unauthorized = require("./unauthorized");

module.exports = {
  CustomAPIError,
  BadRequestError,
  NotFoundError,
  Unauthenticated,
  Unauthorized,
};
