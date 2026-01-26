const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const { connectToDatabase } = require('./db/connection');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectToDatabase();
    console.log(`Storage driver: ${process.env.STORAGE_DRIVER || 'local'}`);
    if (process.env.STORAGE_DRIVER === 'cloudinary') {
      console.log(`Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME || 'not set'}`);
    }
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
