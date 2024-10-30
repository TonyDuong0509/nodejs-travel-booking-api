const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const Customer = require("./../models/CustomerModel");
const { handleUploadImage } = require("./../utils/index");

const showMe = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById({ _id: userId });

  if (!user) {
    throw new CustomAPIError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }

  const customer = await Customer.findOne({ user: user._id })
    .populate({
      path: "user",
      select: "-_id fullName phone email address",
    })
    .select("-_id -updatedAt");

  res.status(StatusCodes.OK).json({ customer });
};

const updateProfile = async (req, res) => {
  const { userId } = req.user;
  const { fullName, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    { _id: userId },
    {
      fullName: fullName,
      phone: phone,
      address: address,
    },
    { new: true }
  );
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }

  res.status(StatusCodes.OK).json({ user });
};

const changeWishlist = async (req, res) => {
  const { userId } = req.user;
  const { roomId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to add/remove wishlist"
    );
  }

  const customer = await Customer.findOne({ user: user._id });

  const wishlist = customer.wishlists.find(
    (item) => item._id.toString() === roomId.toString()
  );

  if (wishlist) {
    customer.wishlists.pull(wishlist);
  } else {
    customer.wishlists.push(roomId);
  }
  await customer.save();

  res.status(StatusCodes.OK).json({ message: "Change wishlists successfully" });
};

const allWishlists = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to see all your wishlists"
    );
  }

  const wishlists = await Customer.findOne({ user: user._id })
    .populate({
      path: "wishlists",
      select: "-_id name slug roomType pricePerNight capacity amenities logo",
    })
    .select("-_id -user -__v -createdAt -updatedAt");

  res.status(StatusCodes.OK).json({ wishlists });
};

const uploadLogo = async (req, res) => {
  await handleUploadImage(req, "userAvatar", User);

  res.status(StatusCodes.OK).json({
    message: "Upload logo user successfully",
  });
};

module.exports = {
  showMe,
  updateProfile,
  changeWishlist,
  allWishlists,
  uploadLogo,
};
