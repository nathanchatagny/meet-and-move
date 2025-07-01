import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import Event from '../models/Event';

interface AuthRequest extends Request {
  user?: any;
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // S'assurer que l'URL de la photo de profil est complète
    let profilePicture = user.profilePicture;
    if (profilePicture && !profilePicture.startsWith('http')) {
      profilePicture = `http://172.22.22.77:3000${profilePicture}`;
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // S'assurer que l'URL de la photo de profil est complète
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      user.profilePicture = `http://172.22.22.77:3000${user.profilePicture}`;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    // Count events created by user
    const eventsCreated = await Event.countDocuments({ creator: userId });

    // Count events where user is a participant
    const eventsJoined = await Event.countDocuments({ participants: userId });

    res.json({
      eventsCreated,
      eventsJoined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '../../uploads', path.basename(user.profilePicture));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Sauvegarder la nouvelle photo avec l'URL complète
    const imageUrl = `http://172.22.22.77:3000/uploads/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: imageUrl,
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
