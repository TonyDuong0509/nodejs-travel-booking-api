const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const Hotel = require("./../models/HotelModel");
const { validateMongoId } = require("./../utils/index");
const slugify = require("slugify");

const getAll = async (req, res) => {
  const hotels = await Hotel.find()
    .populate({
      path: "user",
      select: "fullName phone email address -_id",
    })
    .populate({
      path: "category",
      select: "name -_id",
    })
    .select("-_id -updatedAt");

  res.status(StatusCodes.OK).json({ hotels });
};

const getById = async (req, res) => {
  const { hotelId } = req.params;
  validateMongoId(hotelId);

  const hotel = await Hotel.findById({ _id: hotelId })
    .populate({
      path: "user",
      select: "fullName phone email address -_id",
    })
    .populate({
      path: "category",
      select: "name -_id",
    })
    .select("-_id -updatedAt");

  res.status(StatusCodes.OK).json({ hotel });
};

const editProfile = async (req, res) => {
  const { userId } = req.user;
  validateMongoId(userId);

  const { description, categoryId, phone, address, fullName, highlights } =
    req.body;
  validateMongoId(categoryId);

  const user = await User.findById({ _id: userId });
  const hotel = await Hotel.findOne({ user: user._id });

  if (!user && !hotel) {
    throw new CustomAPIError.NotFoundError("Please login to edit profile");
  } else {
    user.phone = phone;
    user.address = address;
    user.fullName = fullName;
    hotel.description = description;
    hotel.category = categoryId;
    hotel.slug = slugify(user.fullName, { lower: true });
    hotel.highlights = highlights;

    await user.save();
    await hotel.save();
  }

  const info = {
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    description: hotel.description,
    category: hotel.category,
    highlights: hotel.highlights,
  };

  res.status(StatusCodes.OK).json({ info });
};

module.exports = { editProfile, getAll, getById };
