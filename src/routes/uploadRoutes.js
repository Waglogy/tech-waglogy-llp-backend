const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Multer config — store in memory (we stream to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

function streamUpload(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `waglogy/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * @desc    Upload a single image
 * @route   POST /api/v1/upload
 * @access  Private
 */
router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload an image file',
      });
    }

    const folder = req.body.folder || 'projects';
    const result = await streamUpload(req.file.buffer, folder);

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  })
);

/**
 * @desc    Upload multiple images (up to 5)
 * @route   POST /api/v1/upload/multiple
 * @access  Private
 */
router.post(
  '/multiple',
  protect,
  upload.array('images', 5),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one image',
      });
    }

    const folder = req.body.folder || 'projects';
    const uploads = await Promise.all(
      req.files.map((file) => streamUpload(file.buffer, folder))
    );

    res.status(200).json({
      status: 'success',
      data: uploads.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
      })),
    });
  })
);

module.exports = router;
