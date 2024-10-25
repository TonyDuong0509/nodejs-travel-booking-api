const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./customError-api");

class Unauthenticated extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.Unauthenticated;
  }
}

module.exports = Unauthenticated;
