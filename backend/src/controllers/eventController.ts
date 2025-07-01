import { Request, Response } from 'express';
import Event from '../models/Event';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, sport, image } = req.body;
    const creatorId = req.user.userId;

    const event = new Event({
      title,
      description,
      location,
      date: new Date(date),
      sport,
      creator: creatorId,
      participants: [creatorId],
      image,
    });

    await event.save();

    // Add event to user's created events
    await User.findByIdAndUpdate(creatorId, {
      $push: { eventsCreated: event._id }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate('creator', 'name profilePicture')
      .populate('participants', 'name profilePicture')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('participants', 'name profilePicture');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    event.participants.push(userId);
    await event.save();

    // Add event to user's joined events
    await User.findByIdAndUpdate(userId, {
      $push: { eventsJoined: eventId }
    });

    res.json({ message: 'Successfully joined event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const leaveEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(userId)) {
      return res.status(400).json({ message: 'Not joined this event' });
    }

    event.participants = event.participants.filter(id => id.toString() !== userId);
    await event.save();

    // Remove event from user's joined events
    await User.findByIdAndUpdate(userId, {
      $pull: { eventsJoined: eventId }
    });

    res.json({ message: 'Successfully left event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ creator: req.user.userId })
      .populate('creator', 'name')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
