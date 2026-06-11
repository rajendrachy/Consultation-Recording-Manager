import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the local uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Supported formats: ${allowedExtensions.join(', ')}`
      ),
      false
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limits
  },
  fileFilter: fileFilter,
});

export default upload;
