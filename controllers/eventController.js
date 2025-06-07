import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'username');
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  const { title, date, description, location, CheckinsResponsible } = req.body;
  try {
    const event = new Event({
      title,
      date,
      description,
      location,
      CheckinsResponsible: CheckinsResponsible ? CheckinsResponsible.filter(name => name.trim() !== '') : [],
      createdBy: req.user._id
    });
    await event.save();
    const populatedEvent = await Event.findById(event._id).populate('createdBy', 'username');
    res.json(populatedEvent);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};