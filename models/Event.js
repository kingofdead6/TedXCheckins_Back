import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', EventSchema);