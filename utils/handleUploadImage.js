const CustomAPIError = require("./../errors");
const fs = require("fs");
const path = require("path");
const User = require("./../models/UserModel");
const Room = require("./../models/RoomModel");
const Hotel = require("./../models/HotelModel");

const handleUploadImage = async (req, nameFolder, model) => {
  if (!req.files) {
    throw new CustomAPIError.BadRequestError("Not file upload");
  }

  const imageInfo = req.files.image;
  if (!imageInfo.mimetype.startsWith("image")) {
    throw new CustomAPIError.BadRequestError("Please upload image");
  }

  const maxSize = 1024 * 1024;
  if (imageInfo.size > maxSize) {
    throw new CustomAPIError.BadRequestError(
      "Please image size is smaller 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    `./../public/uploads/${nameFolder}/${imageInfo.name}`
  );

  let existingImageFilePath;

  const { userId } = req.user;
  const user = await User.findById({ _id: userId });

  if (model === User) {
    existingImageFilePath = user.avatar
      ? path.join(__dirname, `./../public${user.avatar}`)
      : null;

    user.avatar = `/uploads/${nameFolder}/${imageInfo.name}`;

    await user.save();
  }

  if (model === Room) {
    const hotel = await Hotel.findOne({ user: user._id });
    if (!hotel) {
      throw new CustomAPIError.NotFoundError("Hotel not found for this user");
    }

    const { roomId } = req.body;
    const room = await Room.findOneAndUpdate(
      { _id: roomId },
      { hotel: hotel._id }
    );

    if (!room) {
      throw new CustomAPIError.NotFoundError("Room not found");
    }

    existingImageFilePath = room.logo
      ? path.join(__dirname, `./../public${room.logo}`)
      : null;

    room.logo = `/uploads/${nameFolder}/${imageInfo.name}`;

    await room.save();
  }

  if (existingImageFilePath) {
    try {
      fs.unlinkSync(existingImageFilePath);
    } catch (error) {
      console.error(`Error while deleting old image ${error.message}`);
    }
  }

  await imageInfo.mv(imagePath);
};

module.exports = handleUploadImage;
