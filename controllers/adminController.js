import User from '../models/User.js';
import Event from '../models/Event.js';
import Attendee from '../models/Attendee.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const eventStats = await Event.aggregate([
      {
        $lookup: {
          from: 'attendees',
          localField: '_id',
          foreignField: 'eventId',
          as: 'attendees',
        },
      },
      {
        $project: {
          title: 1,
          totalAttendees: { $size: '$attendees' },
          registeredAttendees: {
            $size: { $filter: { input: '$attendees', cond: { $eq: ['$$this.status', 'registered'] } } },
          },
        },
      },
    ]);

    res.json({ totalUsers, totalEvents, eventStats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};