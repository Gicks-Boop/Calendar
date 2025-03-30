import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.findByUser(
      req.user.id,
      req.params.startDate,
      req.params.endDate
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const eventId = await Event.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ id: eventId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};