const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const {
  queryHelper,
  handleUploadImage,
  handleUploadManyImages,
} = require("./../utils/index");
const User = require("./../models/UserModel");
const Room = require("./../models/RoomModel");
const Hotel = require("./../models/HotelModel");
const slugify = require("slugify");

const create = async (req, res) => {
  const { userId } = req.user;

  const { name, roomType, description, pricePerNight, capacity, amenities } =
    req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login with hotel role to create room"
    );
  }
  const hotel = await Hotel.findOne({ user: user._id });

  const availability = [
    {
      date: new Date(Date.now() + 1000 * 60 * 60 * 7),
      status: "available",
    },
  ];

  const room = await Room.create({
    name,
    slug: slugify(name, { lower: true }),
    roomType,
    description,
    pricePerNight,
    capacity,
    amenities,
    hotel: hotel._id,
    availability,
  });

  res.status(StatusCodes.CREATED).json({ room });
};

const getAllByHotelId = async (req, res) => {
  const { hotelId } = req.params;

  const {
    models: rooms,
    total,
    page,
    limit,
  } = await queryHelper(
    req,
    Room,
    "roomType",
    {
      hotel: hotelId,
    },
    "-_id -hotel -updatedAt"
  );
  if (!rooms || rooms.length === 0) {
    throw new CustomAPIError.NotFoundError(
      "This hotel does not have any room, please choose another hotel"
    );
  }

  res.status(StatusCodes.OK).json({ total, page, limit, rooms });
};

const getById = async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById({ _id: roomId }).select("-_id -hotel");
  if (!room) {
    throw new CustomAPIError.NotFoundError(
      `Not found room with this ID: ${roomId}`
    );
  }
  res.status(StatusCodes.OK).json({ room });
};

const update = async (req, res) => {
  const { userId } = req.user;

  const { roomId } = req.params;

  const { name, roomType, description, pricePerNight, capacity, amenities } =
    req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login with hotel role to update room"
    );
  }
  const hotel = await Hotel.findOne({ user: user._id });
  const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
  if (!hotel && !room) {
    throw new CustomAPIError.NotFoundError("Not found hotel or room");
  }

  room.name = name;
  room.slug = slugify(name, { lower: true });
  name.roomType = roomType;
  room.description = description;
  room.pricePerNight = pricePerNight;
  room.capacity = capacity;
  room.amenities = amenities;

  await room.save();

  res.status(StatusCodes.OK).json({ room });
};

const destroy = async (req, res) => {
  const { userId } = req.user;
  const { roomId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login with hotel role to delete room"
    );
  }
  const hotel = await Hotel.findOne({ user: user._id });
  const room = await Room.findOneAndDelete({ _id: roomId, hotel: hotel._id });
  if (!hotel && !room) {
    throw new CustomAPIError.NotFoundError("Not found hotel or room");
  }

  res
    .status(StatusCodes.NO_CONTENT)
    .json({ message: "Delete room successfully" });
};

const uploadImages = async (req, res) => {
  await handleUploadManyImages(req, "room", Room);

  res
    .status(StatusCodes.OK)
    .json({ message: "Upload images room successfully" });
};

const uploadLogo = async (req, res) => {
  await handleUploadImage(req, "roomLogo", Room);

  res.status(StatusCodes.OK).json({ message: "Upload logo room successfully" });
};

module.exports = {
  create,
  getAllByHotelId,
  getById,
  update,
  destroy,
  uploadImages,
  uploadLogo,
};
