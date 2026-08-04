const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${cleanName}`);
  },
});

function checkFileType(file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }
  const filetypes = /jpg|jpeg|png|webp|gif|heic|heif|avif|svg|bmp|tiff/i;
  const extname = filetypes.test(path.extname(file.originalname));

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Allow up to 20MB per image file
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const router = express.Router();

router.post("/image", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image file exceeds the maximum allowed size of 20MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadImage);

module.exports = router;
