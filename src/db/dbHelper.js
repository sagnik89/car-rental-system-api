import { eq, inArray, and } from "drizzle-orm";
import { db } from "./index.js";
import { users, bookings } from "./schema.js";

export const findUser = async (username) => {
  return db
    .select({
      id: users.id,
      username: users.username,
      password: users.password,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
};

export const createUser = async (username, password) => {
  return db
    .insert(users)
    .values({ username, password })
    .returning({ id: users.id });
};

export const createBooking = async (userId, carName, days, rentPerDay) => {
  const totalCost = days * rentPerDay;

  return db
    .insert(bookings)
    .values({
      userId,
      carName,
      days,
      rentPerDay,
      totalCost,
      status: "booked",
    })
    .returning({
      id: bookings.id,
      carName: bookings.carName,
      days: bookings.days,
      rentPerDay: bookings.rentPerDay,
      totalCost: bookings.totalCost,
      status: bookings.status,
      createdAt: bookings.createdAt,
    });
};

export const findBookingByUser = async (userId) => {
  return db
    .select({
      id: bookings.id,
      carName: bookings.carName,
      days: bookings.days,
      rentPerDay: bookings.rentPerDay,
      totalCost: bookings.totalCost,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        inArray(bookings.status, ["booked", "completed"])
      )
    )
    .orderBy(bookings.createdAt);
};

export const findBookingById = async (bookingId, userId) => {
  return db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      carName: bookings.carName,
      days: bookings.days,
      rentPerDay: bookings.rentPerDay,
      totalCost: bookings.totalCost,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
};

export const updateBookingbyId = async (bookingId, userId, fields) => {

  // if days or rentPerDay is changed
  if (fields.days !== undefined || fields.rentPerDay !== undefined) {
    fields.totalCost = fields.days * fields.rentPerDay;
  }

  return db.update(bookings)
    .set(fields)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .returning({
      id: bookings.id,
      userId: bookings.userId,
      carName: bookings.carName,
      days: bookings.days,
      rentPerDay: bookings.rentPerDay,
      totalCost: bookings.totalCost,
      status: bookings.status,
      createdAt: bookings.createdAt,
    });

}

export const deleteBookingbyId = async (bookingId, userId) => {
  return db
    .delete(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .returning();

};

