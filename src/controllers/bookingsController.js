import { z } from "zod";
import {
  createBooking,
  deleteBookingbyId,
  findBookingById,
  findBookingByUser,
  updateBookingbyId,
} from "../db/dbHelper.js";

// zod schemas
const bookingIdSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
});

const createBookingSchema = z.object({
  carName: z.string().min(1),
  days: z.number().int().min(1).max(365),
  rentPerDay: z.number().int().min(1).max(2000),
});

const updateBookingSchema = z
  .object({
    carName: z.string().min(1).optional(),
    days: z.number().int().min(1).max(365).optional(),
    rentPerDay: z.number().int().min(1).max(2000).optional(),
    status: z.enum(["booked", "completed", "cancelled"]).optional(),
  })
  .strict();

export const postBooking = async (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid Input",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  // console.log(req.user.id + "Hello user")

  const { carName, days, rentPerDay } = parsed.data;

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
      error: { message: "Internal Server Error" },
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
      error: { message: "Internal Server Error" },
    });
  }
};

export const getSingleBooking = async (req, res) => {
  const parsed = bookingIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Booking Not Found",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const { bookingId } = parsed.data;

  try {
    const booking = await findBookingById(bookingId, req.user.id);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Booking not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: "Internal Server Error" },
    });
  }
};

export const updateBooking = async (req, res) => {
  const paramParsed = bookingIdSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Booking Not Found",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const bodyParsed = updateBookingSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid Input",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const { bookingId } = paramParsed.data;
  const newData = bodyParsed.data;

  try {
    const booking = await findBookingById(bookingId, req.user.id);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Booking Not Found" },
      });
    }

    const [result] = await updateBookingbyId(bookingId, req.user.id, newData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: "Internal Server Error" },
    });
  }
};

export const deleteBooking = async (req, res) => {
  const parsed = bookingIdSchema.safeParse(req.params);

  // console.log(bookingId)
  if (!parsed.success) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Booking Not Found",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const { bookingId } = parsed.data;

  try {
    const booking = await findBookingById(bookingId, req.user.id);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Booking not found" },
      });
    }

    await deleteBookingbyId(bookingId, req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: "Internal Server Error" },
    });
  }
};
