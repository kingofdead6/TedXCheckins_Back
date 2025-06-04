import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  const { title, date, description } = req.body;
  try {
    const event = new Event({ title, date, description, createdBy: req.user._id });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Attendee.deleteMany({ eventId: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};