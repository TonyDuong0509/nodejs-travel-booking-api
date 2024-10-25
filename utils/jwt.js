const jwt = require("jsonwebtoken");

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_TOKEN_SECRET);

const isValidToken = (token) => jwt.verify(token, process.env.JWT_TOKEN_SECRET);

const attachCookieToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createToken({ payload: { user } });
  const refreshTokenJWT = createToken({ payload: user, refreshToken });

  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: (process.env.NODE = "PRODUCTION"),
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: (process.env.NODE = "PRODUCTION"),
    signed: true,
    expires: new Date(Date.now() + thirtyDays),
  });
};

module.exports = { createToken, isValidToken, attachCookieToResponse };
