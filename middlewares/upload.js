const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// 1) uploads klasörünün varlığını kontrol et
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// 2) disk storage tanımı
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    // örn: profilePic-userId-1634234234.jpg
    const ext = path.extname(file.originalname);
    const name = `profilePic-${req.user.id}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  // sadece resim uzantılarına izin ver
  const allowed = ['.jpg', '.jpeg', '.png'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Sadece JPG/PNG kabul edilir'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5*1024*1024 } });

module.exports = upload;
