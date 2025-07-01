import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { signup, login, getProfile, getUserStats, updateProfilePicture } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Configuration multer pour les uploads d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateJWT, getProfile);
router.get('/stats', authenticateJWT, getUserStats);
router.put('/profile-picture', authenticateJWT, upload.single('profilePicture'), updateProfilePicture);

export default router; 