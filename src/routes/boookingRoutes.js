import express from "express";

import { verifyToken } from "../middleware/authMiddleware.js";

import {
  deleteBooking,
  getBookings,
  getSingleBooking,
  postBooking,
  updateBooking,
} from "../controllers/bookingsController.js";


const router = express.Router();

//defined globally [applicable to all routes]
router.use(verifyToken); 

//get all bookings 
router.get("/", getBookings);

// get a single booking 
router.get("/:bookingId", getSingleBooking);

// create a booking 
router.post("/", postBooking);

// update a booking
router.put("/:bookingId", updateBooking);

// delete a booking
router.delete("/:bookingId", deleteBooking);

export default router;
