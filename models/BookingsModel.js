const { Schema, model } = require("mongoose");

const bookingsSchema = new Schema({
  cleanerName: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  notDone: { type: Boolean, required: true, default: true },
  approved: { type: Boolean },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

const BookingsModel = model("Bookings", bookingsSchema);

module.exports = BookingsModel;
