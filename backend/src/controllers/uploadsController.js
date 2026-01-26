const asyncHandler = require('../middleware/asyncHandler');
const { uploadImages: uploadImagesToStorage } = require('../services/storage');

const uploadImages = asyncHandler(async (req, res) => {
  const folder = req.body.type || 'objects';
  const files = await uploadImagesToStorage(req.files || [], folder);
  res.json({ files });
});

module.exports = {
  uploadImages,
};
