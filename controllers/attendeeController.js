import XLSX from 'xlsx';
import QRCode from 'qrcode';
import Attendee from '../models/Attendee.js';
import Event from '../models/Event.js';

export const getAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const attendees = await Attendee.find({ eventId: req.params.eventId });
    res.json(attendees);
  } catch (err) {
    console.error('Error in getAttendees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadAttendees = async (req, res) => {
  try {
    // Validate eventId
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Processing Excel file for event:', req.params.eventId);
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Validate data
    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }
    if (!data.every(row => row.name && row.email)) {
      return res.status(400).json({ message: 'Excel file must contain name and email columns' });
    }

    const attendees = await Promise.all(data.map(async (row) => {
      const qrCodeData = JSON.stringify({ eventId: req.params.eventId, data: row });
      const qrCode = await QRCode.toDataURL(qrCodeData);
      return new Attendee({ eventId: req.params.eventId, data: row, qrCode });
    }));

    await Attendee.insertMany(attendees);
    console.log(`Uploaded ${attendees.length} attendees for event ${req.params.eventId}`);
    res.json({ message: 'Attendees uploaded successfully', count: attendees.length });
  } catch (err) {
    console.error('Error in uploadAttendees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const validateQRCode = async (req, res) => {
  const { qrCodeData } = req.body;
  try {
    const parsedData = JSON.parse(qrCodeData);
    const { eventId, data } = parsedData;
    
    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.json({ valid: false, message: 'Invalid QR code: Event not found' });
    }

    // Find attendee by eventId and exact data match
    const attendee = await Attendee.findOne({ 
      eventId, 
      data: { $eq: data }
    });
    
    if (!attendee) {
      return res.json({ valid: false, message: 'Attendee not found' });
    }

    if (attendee.status === 'registered') {
      return res.json({ valid: false, message: 'Attendee already registered' });
    }

    // Mark as registered
    attendee.status = 'registered';
    attendee.validationTime = new Date();
    await attendee.save();
    
    res.json({ 
      valid: true, 
      message: 'Registration successful', 
      attendee: {
        data: { name: attendee.data.name, email: attendee.data.email },
        status: attendee.status,
        validationTime: attendee.validationTime
      }
    });
  } catch (err) {
    console.error('Error in validateQRCode:', err);
    res.status(500).json({ valid: false, message: 'Server error', error: err.message });
  }
};