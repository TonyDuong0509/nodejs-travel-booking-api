const CustomAPIError = require("./../errors");
const UserToken = require("./../models/UserToken");
const { isValidToken, attachCookieToResponse } = require("./../utils/index");

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    if (accessToken) {
      const { payload } = isValidToken(accessToken);
      req.user = payload.user;
      return next();
    }

    // If accessToken is expired
    const { payload } = isValidToken(refreshToken);
    const existingToken = await UserToken.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    if (!existingToken || !existingToken?.isValid()) {
      throw new CustomAPIError.Unauthenticated("Authenticated Invalid");
    }

    attachCookieToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomAPIError.Unauthenticated("Authenticated Invalid");
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError.Unauthorized(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermission };
