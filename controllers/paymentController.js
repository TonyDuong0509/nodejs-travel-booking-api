const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const User = require("./../models/UserModel");
const Booking = require("./../models/BookingModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripePayment = async (req, res) => {
  const { userId } = req.user;
  const { bookingId } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(`Please login to payment`);
  }

  const booking = await Booking.findOne({ _id: bookingId, user: user._id });
  if (!booking) {
    throw new CustomAPIError.NotFoundError(
      `Not found booking with this ID: ${bookingId}`
    );
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.total,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  booking.paymentIntentId = paymentIntent.id;
  await booking.save();

  res.status(StatusCodes.OK).json({
    paymentIntentId: booking.paymentIntentId,
  });
};

const confirmPayment = async (req, res) => {
  const { paymentIntentId, paymentMethod } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment successfully",
      paymentIntent,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Confirm payment failed",
      error: error.message,
    });
  }
};

module.exports = { stripePayment, confirmPayment };
