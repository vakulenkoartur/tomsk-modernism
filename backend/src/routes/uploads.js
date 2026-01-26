const express = require('express');
const { createUpload } = require('../middleware/upload');
const upload = createUpload();
const { uploadImages } = require('../controllers/uploadsController');

const router = express.Router();

router.post('/', upload.array('images', 5), uploadImages);

module.exports = router;
