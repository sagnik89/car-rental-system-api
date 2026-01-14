import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";


export const bookingStatusEnum = pgEnum("booking_status", [
  "booked",
  "completed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  username: varchar("username", { length: 255 }).notNull().unique(),

  password: varchar("password", { length: 255 }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  carName: varchar("car_name", { length: 255 }).notNull(),

  days: integer("days").notNull(),

  rentPerDay: integer("rent_per_day").notNull(),

  totalCost: integer("total_cost").notNull(), 

  status: bookingStatusEnum("status").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
