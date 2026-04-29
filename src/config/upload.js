const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // prefix based on route context — proof or sku
    const prefix = req.baseUrl?.includes('skus') ? 'sku' : 'proof';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
