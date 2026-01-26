const express = require('express');
const { createUpload } = require('../middleware/upload');
const upload = createUpload('architects');
const {
  listArchitects,
  getArchitect,
  createArchitect,
  updateArchitect,
  deleteArchitect,
} = require('../controllers/architectsController');

const router = express.Router();

router.get('/', listArchitects);
router.get('/:id', getArchitect);
router.post('/', upload.single('image'), createArchitect);
router.put('/:id', upload.single('image'), updateArchitect);
router.delete('/:id', deleteArchitect);

module.exports = router;
