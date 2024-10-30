const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const Hotel = require("./../models/HotelModel");
const Room = require("./../models/RoomModel");
const path = require("path");

const handleUploadManyImages = async (req, nameFolder, model) => {
  if (!req.files || !req.files.images) {
    throw new CustomAPIError.BadRequestError("No files uploaded");
  }

  const images = Array.isArray(req.files.images)
    ? req.files.images
    : [req.files.images];

  const maxSize = 1024 * 1024;
  const uploadedImages = [];

  for (let imageInfo of images) {
    if (!imageInfo.mimetype.startsWith("image")) {
      throw new CustomAPIError.BadRequestError("Please upload image");
    }
    if (imageInfo.size > maxSize) {
      throw new CustomAPIError.BadRequestError(
        "Please upload images smaller than 1MB"
      );
    }
    const imagePath = path.join(
      __dirname,
      `./../public/uploads/${nameFolder}/${imageInfo.name}`
    );
    await imageInfo.mv(imagePath);

    uploadedImages.push({
      url: `/uploads/${nameFolder}/${imageInfo.name}`,
      isFeatured: false,
    });
  }

  const { userId } = req.user;
  const user = await User.findById({ _id: userId });
  const hotel = await Hotel.findOne({ user: user._id });

  if (model === Hotel) {
    hotel.images = uploadedImages;
    return await hotel.save();
  }

  if (model === Room) {
    const { roomId } = req.body;
    const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
    room.images = uploadedImages;
    return await room.save();
  }
};

module.exports = handleUploadManyImages;
