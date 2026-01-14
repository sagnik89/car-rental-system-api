import { createBooking, deleteBookingbyId, findBookingById, findBookingByUser, updateBookingbyId } from "../db/dbHelper.js";

export const postBooking = async (req, res) => {
  const { carName, days, rentPerDay } = req.body;

  if (
    !carName ||
    !Number.isInteger(days) ||
    days <= 0 ||
    days > 365 ||
    !Number.isInteger(rentPerDay) ||
    rentPerDay <= 0 ||
    rentPerDay > 2000
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid inputs",
    });
  }

  // console.log(req.user.id + "Hello user")

  try {
    const [result] = await createBooking(
      req.user.id,
      carName,
      days,
      rentPerDay
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: result.id,
        totalCost: result.totalCost,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error ---" + error.message,
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await findBookingByUser(req.user.id);

    let totalAmount = 0;
    bookings.forEach((item) => {
      totalAmount += item.totalCost;
      // console.log(totalAmount);
    });


    if (req.query.summary === "true") {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.id,
          username: req.user.username,
          totalBookings: bookings.length,
          totalAmountSpent: totalAmount,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error ---" + error.message,
    });
  }
};

export const getSingleBooking = async (req, res) => {

  const { bookingId } = req.params
  

  // console.log(bookingId)
  
  if (!Number.isInteger(parseInt(bookingId))) {
    return res.status(404).json({
      success: false,
      error:"Booking not found"
    })
  }

  try {
    const booking = await findBookingById(parseInt(bookingId), req.user.id);
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error --- " + error.message,
    });
  }
};

export const updateBooking = async (req, res) => {

  const { bookingId } = req.params
  
  const newData = req.body

  if (!Number.isInteger(parseInt(bookingId))) {
    return res.status(404).json({
      success: false,
      error: "Booking not found",
    });
  }

  try {
    const booking = await findBookingById(parseInt(bookingId), req.user.id);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // filtering the data 
    const allowedFields = ["days", "rentPerDay", "status", "carName"];
    const incomingKeys = Object.keys(newData);
    const validKeys = incomingKeys.filter((key) => allowedFields.includes(key));
    const filteredData = validKeys.reduce((obj, key) => {
      obj[key] = newData[key];
      return obj;
    }, {});

    

    const [result] = await updateBookingbyId(bookingId, req.user.id, filteredData)

    return res.status(200).json({
      success: true,
      data: result,
    });

    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error --- " + error.message,
    });
  }

};

export const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  // console.log(bookingId)

  if (!Number.isInteger(parseInt(bookingId))) {
    return res.status(404).json({
      success: false,
      error: "Booking not found",
    });
  }

  try {
    const booking = await findBookingById(parseInt(bookingId), req.user.id);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const [result] = await deleteBookingbyId(bookingId, req.user.id)

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error --- " + error.message,
    });
  }
};
