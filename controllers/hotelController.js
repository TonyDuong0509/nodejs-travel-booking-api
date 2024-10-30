const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const Hotel = require("./../models/HotelModel");
const {
  queryHelper,
  handleUploadImage,
  handleUploadManyImages,
} = require("./../utils/index");
const slugify = require("slugify");
const path = require("path");

const getAll = async (req, res) => {
  const {
    models: hotels,
    total,
    page,
    limit,
  } = await queryHelper(req, Hotel, null, {}, "-_id -updatedAt", [
    {
      path: "user",
      select: "fullName phone email address -_id",
    },
    {
      path: "category",
      select: "name slug -_id",
    },
  ]);

  if (!hotels || hotels.length === 0) {
    throw new CustomAPIError.NotFoundError("Does not have any hotel");
  }

  res.status(StatusCodes.OK).json({ total, page, limit, hotels });
};

const getById = async (req, res) => {
  const { hotelId } = req.params;

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

  const { description, categoryId, phone, address, fullName, highlights } =
    req.body;

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

const uploadImages = async (req, res) => {
  await handleUploadManyImages(req, "hotel", Hotel);

  res
    .status(StatusCodes.OK)
    .json({ message: "Upload images hotel successfully" });
};

const updateImageFeatured = async (req, res) => {
  const { userId } = req.user;
  const { imageUrl } = req.body;

  const user = await User.findById({ _id: userId, "images.url": imageUrl });
  const hotel = await Hotel.findOne({ user: user._id });

  if (!hotel) {
    throw new CustomAPIError.NotFoundError(
      `Not found hotel with this ID: ${user._id}`
    );
  }

  const image = hotel.images.find((img) => img.url === imageUrl);
  if (image) {
    image.isFeatured = !image.isFeatured;
    await hotel.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ message: "Updated featured image successfully" });
};

const uploadLogo = async (req, res) => {
  await handleUploadImage(req, "hotelLogo", User);

  res.status(StatusCodes.OK).json({
    message: "Upload logo hotel successfully",
  });
};

module.exports = {
  editProfile,
  getAll,
  getById,
  uploadImages,
  updateImageFeatured,
  uploadLogo,
};
