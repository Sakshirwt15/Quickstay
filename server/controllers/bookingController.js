import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

// Function to Check Availability of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    // Convert dates to proper Date objects and normalize to start/end of day
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    // Normalize dates to avoid timezone issues
    checkIn.setUTCHours(0, 0, 0, 0);
    checkOut.setUTCHours(23, 59, 59, 999);

    console.log('Checking availability for:', {
      room,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString()
    });

    // Find overlapping bookings with corrected logic
    const bookings = await Booking.find({
      room,
      status: { $ne: 'cancelled' }, // Exclude cancelled bookings
      $or: [
        // Case 1: Existing booking starts during our stay
        {
          checkInDate: { $gte: checkIn, $lt: checkOut }
        },
        // Case 2: Existing booking ends during our stay  
        {
          checkOutDate: { $gt: checkIn, $lte: checkOut }
        },
        // Case 3: Existing booking completely covers our stay
        {
          checkInDate: { $lte: checkIn },
          checkOutDate: { $gte: checkOut }
        }
      ]
    });

    console.log('Found overlapping bookings:', bookings.length);
    
    const isAvailable = bookings.length === 0;
    return isAvailable;

  } catch (error) {
    console.error('Error checking availability:', error.message);
    return false; // Return false on error to be safe
  }
};

// API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    // Validate input
    if (!room || !checkInDate || !checkOutDate) {
      return res.json({ 
        success: false, 
        message: "Missing required fields: room, checkInDate, checkOutDate" 
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.json({ 
        success: false, 
        message: "Invalid date format" 
      });
    }

    if (checkIn >= checkOut) {
      return res.json({ 
        success: false, 
        message: "Check-out date must be after check-in date" 
      });
    }

    // Check if dates are in the past
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.json({ 
        success: false, 
        message: "Check-in date cannot be in the past" 
      });
    }

    const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
    res.json({ success: true, isAvailable });
  } catch (error) {
    console.error('CheckAvailabilityAPI error:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    // Validate input
    if (!room || !checkInDate || !checkOutDate || !guests) {
      return res.json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.json({ 
        success: false, 
        message: "Invalid date format" 
      });
    }

    if (checkIn >= checkOut) {
      return res.json({ 
        success: false, 
        message: "Check-out date must be after check-in date" 
      });
    }

    // Check if dates are in the past
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.json({ 
        success: false, 
        message: "Check-in date cannot be in the past" 
      });
    }

    // Before Booking Check Availability
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.json({ 
        success: false, 
        message: "Room is not available for the selected dates" 
      });
    }

    // Get totalPrice from Room
    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) {
      return res.json({ 
        success: false, 
        message: "Room not found" 
      });
    }

    let totalPrice = roomData.pricePerNight;

    // Calculate totalPrice based on nights
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      return res.json({ 
        success: false, 
        message: "Invalid date range" 
      });
    }

    totalPrice *= nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: 'Hotel Booking Details',
      html: `
        <h2>Your Booking Details</h2>
        <p>Dear ${req.user.username},</p>
        <p>Thank you for your booking! Here are your details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.id}</li>
          <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
          <li><strong>Location:</strong> ${roomData.hotel.address}</li>
          <li><strong>Check-in:</strong> ${booking.checkInDate.toDateString()}</li>
          <li><strong>Check-out:</strong> ${booking.checkOutDate.toDateString()}</li>
          <li><strong>Guests:</strong> ${booking.guests}</li>
          <li><strong>Nights:</strong> ${nights}</li>
          <li><strong>Total Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}</li>
        </ul>
        <p>We look forward to welcoming you!</p>
        <p>If you need to make any changes, feel free to contact us.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.json({ success: true, message: "Booking created successfully", booking });

  } catch (error) {
    console.error('CreateBooking error:', error);
    res.json({ success: false, message: "Failed to create booking" });
  }
};
// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('GetUserBookings error:', error);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });
    // Total Bookings
    const totalBookings = bookings.length;
    // Total Revenue
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

    res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
  } catch (error) {
    console.error('GetHotelBookings error:', error);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    const totalPrice = booking.totalPrice;
    const { origin } = req.headers;

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Create Line Items for Stripe
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: roomData.hotel.name,
          },
          unit_amount: totalPrice * 100,
        },
        quantity: 1,
      },
    ];

    // Create Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      metadata: {
        bookingId,
      },
    });
    res.json({ success: true, url: session.url });

  } catch (error) {
    console.error('StripePayment error:', error);
    res.json({ success: false, message: "Payment Failed" });
  }
};