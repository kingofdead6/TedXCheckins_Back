import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  data: mongoose.Schema.Types.Mixed, // Dynamic fields from Excel
  qrCode: String,
  status: { type: String, enum: ['pending', 'registered'], default: 'pending' },
  validationTime: Date,
});

export default mongoose.model('Attendee', AttendeeSchema);