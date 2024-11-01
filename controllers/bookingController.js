const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const Booking = require("./../models/BookingModel");
const User = require("./../models/UserModel");
const Hotel = require("./../models/HotelModel");
const Room = require("./../models/RoomModel");
const {
  createNotification,
} = require("./../controllers/notificationController");
const { checkPermissions, sendEmail } = require("./../utils/index");

const isRoomAvailable = (checkIn, checkOut, availability) => {
  const dateRange = [];
  let currentDate = new Date(checkIn);

  while (currentDate <= new Date(checkOut)) {
    dateRange.push(new Date(currentDate).setHours(0, 0, 0, 0));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange.every((date) => {
    const day = availability.find(
      (d) => new Date(d.date).setHours(0, 0, 0, 0) === date
    );
    return day && day.status === "available";
  });
};

const createBooking = async (req, res) => {
  const { userId } = req.user;
  const { checkIn, checkOut, roomId } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError("Please login to booking room");
  }

  const room = await Room.findById({ _id: roomId });
  if (!room) {
    throw new CustomAPIError.NotFoundError(
      `Room not found with this ID: ${roomId}`
    );
  }

  const isBooked = await Booking.findOne({ user: user._id, room: room._id });
  if (isBooked) {
    throw new CustomAPIError.BadRequestError("You already booked this room");
  }

  const isAvailable = isRoomAvailable(checkIn, checkOut, room.availability);

  if (!isAvailable) {
    throw new CustomAPIError.BadRequestError(
      "Room is not available for selected dates, please try another date"
    );
  }

  let currentDate = new Date(checkIn);
  while (currentDate <= new Date(checkOut)) {
    const day = room.availability.find(
      (d) =>
        new Date(d.date).setHours(0, 0, 0, 0) ===
        currentDate.setHours(0, 0, 0, 0)
    );
    if (day) {
      day.status = "booked";
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  await room.save();

  const days =
    Math.ceil(new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  const total = room.pricePerNight * days;

  const booking = await Booking.create({
    checkIn,
    checkOut,
    total: total,
    user: user._id,
    room: room._id,
    hotel: room.hotel,
  });

  const hotel = await Hotel.findById({ _id: room.hotel });
  if (!hotel) {
    throw new CustomAPIError.NotFoundError(
      `Not found hotel with this ID: ${room.hotel}`
    );
  }
  const hotelUser = await User.findById({ _id: hotel.user });
  if (!hotelUser) {
    throw new CustomAPIError.NotFoundError(
      `Not found hotel user with this ID: ${hotel.user}`
    );
  }

  const message = `A customer booking room: ${room.name}`;
  const link = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/booking/details-booking/${booking._id}`;

  await createNotification(hotelUser._id, message, link);

  await await sendEmail({
    to: hotelUser.email,
    subject: `A customer booked room: ${room.name}.`,
    html: `Hello ${hotelUser.fullName}. Has a customer's name: ${user.fullName} booking room, please check and change status booking`,
  });

  res.status(StatusCodes.OK).json({ booking });
};

const cancelBooking = async (req, res) => {
  const { userId } = req.user;
  const { roomId } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError("Please login to booking room");
  }

  const room = await Room.findById({ _id: roomId });
  if (!room) {
    throw new CustomAPIError.NotFoundError(
      `Room not found with this ID: ${roomId}`
    );
  }

  const canceledBooking = await Booking.findOneAndDelete({
    user: user._id,
    room: room._id,
  });
  if (!canceledBooking) {
    throw new CustomAPIError.NotFoundError("Booking not found");
  }

  const checkIn = canceledBooking.checkIn;
  const checkOut = canceledBooking.checkOut;

  let currentDate = new Date(checkIn);
  while (currentDate <= new Date(checkOut)) {
    const day = room.availability.find(
      (d) =>
        new Date(d.date).setHours(0, 0, 0, 0) ===
        currentDate.setHours(0, 0, 0, 0)
    );
    if (day) {
      day.status = "available";
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  await room.save();

  res
    .status(StatusCodes.OK)
    .json({ message: "Cancelled Booking successfully" });
};

const getCustomerBookings = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to see your bookings room"
    );
  }

  checkPermissions(req.user, userId);

  const myBookings = await Booking.find({ user: user._id })
    .populate({
      path: "room",
      select: "-_id name slug roomType pricePerNight",
    })
    .populate({
      path: "hotel",
      select: "createdAt -_id",
      populate: {
        path: "user",
        select: "-_id fullName phone address",
      },
    })
    .select("-_id -user");

  if (!myBookings || myBookings.length === 0) {
    throw new CustomAPIError.NotFoundError("You do not have booked any room !");
  }

  res.status(StatusCodes.OK).json({ myBookings });
};

const hotelCheckBookingPending = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to see hotel's bookings room"
    );
  }

  const hotel = await Hotel.findOne({ user: user._id });
  if (!hotel) {
    throw new CustomAPIError.NotFoundError(
      `Not found hotel with this ID: ${user._id}`
    );
  }

  const hotelBookingsPending = await Booking.find({
    hotel: hotel._id,
    status: "Pending",
  })
    .populate({
      path: "room",
      select: "-_id name slug roomType pricePerNight",
    })
    .populate({
      path: "user",
      select: "-_id fullName phone email",
    })
    .select("-_id -hotel");

  if (!hotelBookingsPending || hotelBookingsPending.length === 0) {
    throw new CustomAPIError.NotFoundError("Hotel does not have any bookings");
  }

  res.status(StatusCodes.OK).json({ hotelBookingsPending });
};

const getDetailsBooking = async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      `Please login to see your details booking`
    );
  }

  let booking;

  if (user && user.role === "Hotel") {
    booking = await Booking.findById({ _id: bookingId })
      .populate({
        path: "user",
        select: "-_id fullName phone email",
      })
      .populate({
        path: "room",
        select: "-_id name slug roomType pricePerNight",
      })
      .select("-_id -hotel");
  } else if (user && user.role === "Customer") {
    booking = await Booking.findById({ _id: bookingId })
      .populate({
        path: "room",
        select: "-_id name slug roomType pricePerNight",
      })
      .populate({
        path: "hotel",
        select: "-_id -rating -category -description -highlights -images",
        populate: {
          path: "user",
          select: "-_id fullName phone email",
        },
      })
      .select("-_id -user");
  }

  if (!booking) {
    throw new CustomAPIError.NotFoundError(
      `Not found booking with this ID: ${bookingId}`
    );
  }

  res.status(StatusCodes.OK).json({ booking });
};

const hotelChangeStatus = async (req, res) => {
  const { userId } = req.user;
  const { status } = req.body;
  const { bookingId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to see hotel's bookings room"
    );
  }

  const hotel = await Hotel.findOne({ user: user._id });
  if (!hotel) {
    throw new CustomAPIError.NotFoundError(
      `Not found hotel with this ID: ${user._id}`
    );
  }

  let booking;

  if (status === "Canceled") {
    booking = await Booking.findOneAndDelete(
      {
        _id: bookingId,
        hotel: hotel._id,
      },
      { status: status },
      { new: true }
    );
  } else {
    booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        hotel: hotel._id,
      },
      { status: status },
      { new: true }
    );
  }

  const userBooking = await User.findById({ _id: booking.user });

  const message = `Hotel change status booking: ${status}`;
  const link = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/booking/details-booking/${booking._id}`;

  await createNotification(userBooking._id, message, link);

  await sendEmail({
    to: userBooking.email,
    subject: `Your booking is changed status by Hotel: ${user.fullName}`,
    html: `Hello ${userBooking.fullName}. Hotel has change status "${status}" your booking, please check your booking`,
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "Change booking status successfully" });
};

module.exports = {
  createBooking,
  cancelBooking,
  getCustomerBookings,
  hotelCheckBookingPending,
  getDetailsBooking,
  hotelChangeStatus,
};
