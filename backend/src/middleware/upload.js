const path = require('path');
const fs = require('fs');
const multer = require('multer');

const resolveFolder = (req, fallback) => req.body.type || fallback || 'objects';

const createUpload = (folder) => {
  const useCloudinary = process.env.STORAGE_DRIVER === 'cloudinary';
  const storage = useCloudinary
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          const target = resolveFolder(req, folder);
          const uploadDir = path.join(__dirname, '../../uploads', target);
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only jpeg, png, or webp images are allowed'));
      }
    },
  });
};

module.exports = {
  createUpload,
  resolveFolder,
};
