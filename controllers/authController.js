const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const UserToken = require("./../models/UserToken");
const Hotel = require("./../models/HotelModel");
const Customer = require("./../models/CustomerModel");
const crypto = require("crypto");
const passport = require("passport");
const {
  createTokenUser,
  attachCookieToResponse,
  sendVerificationEmail,
} = require("./../utils/index");
const slugify = require("slugify");

const register = async (req, res) => {
  const { fullName, phone, address, email, password, role } = req.body;

  const existingEmail = await User.findOne({ email: email });
  if (existingEmail) {
    throw new CustomAPIError.BadRequestError(
      "Email already exist, please try another email"
    );
  }
  const isFirstAccount = (await User.countDocuments()) === 0;
  const userRole = isFirstAccount ? "Admin" : role;
  if (!isFirstAccount && (!role || !["Hotel", "Customer"].includes(role))) {
    throw new CustomAPIError.BadRequestError("Please provide valid role value");
  }

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    fullName,
    phone,
    address,
    email,
    password,
    role: userRole,
    verificationToken,
  });

  if (role === "Hotel") {
    await Hotel.create({
      slug: slugify(fullName, { lower: true }),
      user: user._id,
    });
  }

  if (role === "Customer") {
    await Customer.create({
      user: user._id,
    });
  }

  await sendVerificationEmail({
    name: user.fullName,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Success, please check your email to verify account !" });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomAPIError.Unauthenticated(
      "Email is not correct, please try again"
    );
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomAPIError.Unauthenticated("Verification Failed");
  }
  user.isVerified = true;
  user.verified = new Date().getTime() + 1000 * 60 * 60 * 7;
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({
    message: "Email is verified",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomAPIError.BadRequestError("Please provide fields value");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomAPIError.BadRequestError("Invalid Credentials");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new CustomAPIError.BadRequestError("Invalid Credentials");
  }
  if (user.isVerified === false) {
    throw new CustomAPIError.BadRequestError(
      "Please check your email and verify account to login"
    );
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = "";

  const existingToken = await UserToken.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomAPIError.BadRequestError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;

    await User.updateOne({ _id: user._id }, { $set: { isLogged: true } });

    attachCookieToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, userAgent, ip, user: user._id };
  await UserToken.create(userToken);

  await User.updateOne({ _id: user._id }, { $set: { isLogged: true } });

  attachCookieToResponse({ res, user: tokenUser, refreshToken });
  res.status(StatusCodes.OK).json({ message: "Login successfully !" });
};

const logout = async (req, res) => {
  const { userId } = req.user;

  await UserToken.findOneAndDelete({ user: userId });
  await User.updateOne({ _id: userId }, { $set: { isLogged: false } });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ message: "User logged out" });
};

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  googleAuth,
};
