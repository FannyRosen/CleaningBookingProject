const { Schema, model } = require("mongoose");

const bookingsSchema = new Schema({
  cleanerName: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
});

const BookingsModel = model("Bookings", bookingsSchema);

module.exports = BookingsModel;
