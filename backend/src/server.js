const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));



// Storage для загрузки фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.type || 'objects';
    const uploadDir = path.join(__dirname, '../uploads', folder);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения допускаются'));
    }
  }
});

// Mock Database
let database = {
  objects: [
  
    {
      id: 2,
      address: "ул. Ленина, 45",
      lat: 56.4866,
      lng: 84.9719,
      isUnique: true,  // или true
      hasCard: true,   // или true
      name: "Дом ", // только если hasCard = true
      desc: "...",      // только если hasCard = true
      architect: "...", // только если hasCard = true
      year: "1930",     // только если hasCard = true
      image: "..."      // только если hasCard = true
    }
  ],
  architects: [
    { 
      id: 1, 
      name: 'Харольд Килис', 
      years: '1920-1990', 
      bio: 'Британский архитектор',
      image: null,
      createdAt: new Date()
    }
  ],
  mosaics: [
    { 
      id: 1, 
      name: 'Мозаика 1', 
      location: 'здание 1', 
      desc: 'Советская мозаика',
      image: null,
      createdAt: new Date()
    }
  ]
};

// OBJECTS API
app.get('/api/objects', (req, res) => {
  res.json(database.objects);
});

app.post('/api/objects', upload.single('image'), (req, res) => {
  const {
    name,
    architect,
    year,
    address,
    desc,
    lat,
    lng,
    isUnique,
    hasCard,
    polygonCoords,
    articleBlocks
  } = req.body;
  
  const newObject = {
    id: Math.max(...database.objects.map(o => o.id), 0) + 1,
    name,
    architect,
    year: parseInt(year),
    address,
    desc,
    image: req.file ? `/objects/${req.file.filename}` : null,
    lat: parseFloat(lat) || 56.4866,
    lng: parseFloat(lng) || 84.9719,
    isUnique: isUnique === 'true' || isUnique === true,
    hasCard: hasCard === 'true' || hasCard === true,
    polygonCoords: polygonCoords ? JSON.parse(polygonCoords) : [],
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : [],
    createdAt: new Date()
  };
  
  database.objects.push(newObject);
  res.status(201).json(newObject);
});

app.put('/api/objects/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const index = database.objects.findIndex(o => o.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  const {
    name, architect, year, address, desc, lat, lng,
    isUnique, hasCard, polygonCoords, articleBlocks
  } = req.body;

  const current = database.objects[index];
  const updated = {
    ...current,
    name: name ?? current.name,
    architect: architect ?? current.architect,
    year: year !== undefined ? parseInt(year) : current.year,
    address: address ?? current.address,
    desc: desc ?? current.desc,
    lat: lat !== undefined ? parseFloat(lat) : current.lat,
    lng: lng !== undefined ? parseFloat(lng) : current.lng,
    isUnique: isUnique !== undefined ? (isUnique === 'true' || isUnique === true) : current.isUnique,
    hasCard: hasCard !== undefined ? (hasCard === 'true' || hasCard === true) : current.hasCard,
    polygonCoords: polygonCoords ? JSON.parse(polygonCoords) : current.polygonCoords,
    image: req.file ? `/objects/${req.file.filename}` : current.image,
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : current.articleBlocks
  };

  database.objects[index] = updated;
  res.json(updated);
});

app.delete('/api/objects/:id', (req, res) => {
  const { id } = req.params;
  database.objects = database.objects.filter(o => o.id !== parseInt(id));
  res.json({ message: 'Удалено' });
});

// ARCHITECTS API
app.get('/api/architects', (req, res) => {
  res.json(database.architects);
});

app.post('/api/architects', upload.single('image'), (req, res) => {
  const { name, years, bio, articleBlocks } = req.body;
  
  const newArchitect = {
    id: Math.max(...database.architects.map(a => a.id), 0) + 1,
    name,
    years,
    bio,
    image: req.file ? `/architects/${req.file.filename}` : null,
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : [],
    createdAt: new Date()
  };
  
  database.architects.push(newArchitect);
  res.status(201).json(newArchitect);
});

app.put('/api/architects/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const index = database.architects.findIndex(a => a.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  const { name, years, bio, articleBlocks } = req.body;
  const current = database.architects[index];
  const updated = {
    ...current,
    name: name ?? current.name,
    years: years ?? current.years,
    bio: bio ?? current.bio,
    image: req.file ? `/architects/${req.file.filename}` : current.image,
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : current.articleBlocks
  };

  database.architects[index] = updated;
  res.json(updated);
});

app.delete('/api/architects/:id', (req, res) => {
  const { id } = req.params;
  database.architects = database.architects.filter(a => a.id !== parseInt(id));
  res.json({ message: 'Удалено' });
});

// MOSAICS API
app.get('/api/mosaics', (req, res) => {
  res.json(database.mosaics);
});

app.post('/api/mosaics', upload.single('image'), (req, res) => {
  const { name, author, year, location, desc, lat, lng, polygonCoords, isUnique, hasCard, articleBlocks } = req.body;
  
  const newMosaic = {
    id: Math.max(...database.mosaics.map(m => m.id), 0) + 1,
    name,
    author,
    year: year ? parseInt(year) : undefined,
    location,
    desc,
    image: req.file ? `/mosaics/${req.file.filename}` : null,
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    polygonCoords: polygonCoords ? JSON.parse(polygonCoords) : [],
    isUnique: isUnique === 'true' || isUnique === true,
    hasCard: hasCard === 'true' || hasCard === true,
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : [],
    createdAt: new Date()
  };
  
  database.mosaics.push(newMosaic);
  res.status(201).json(newMosaic);
});

app.put('/api/mosaics/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const index = database.mosaics.findIndex(m => m.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  const { name, author, year, location, desc, lat, lng, polygonCoords, isUnique, hasCard, articleBlocks } = req.body;
  const current = database.mosaics[index];
  const updated = {
    ...current,
    name: name ?? current.name,
    author: author ?? current.author,
    year: year !== undefined ? parseInt(year) : current.year,
    location: location ?? current.location,
    desc: desc ?? current.desc,
    lat: lat !== undefined ? parseFloat(lat) : current.lat,
    lng: lng !== undefined ? parseFloat(lng) : current.lng,
    polygonCoords: polygonCoords ? JSON.parse(polygonCoords) : current.polygonCoords,
    isUnique: isUnique !== undefined ? (isUnique === 'true' || isUnique === true) : current.isUnique,
    hasCard: hasCard !== undefined ? (hasCard === 'true' || hasCard === true) : current.hasCard,
    image: req.file ? `/mosaics/${req.file.filename}` : current.image,
    articleBlocks: articleBlocks ? JSON.parse(articleBlocks) : current.articleBlocks
  };

  database.mosaics[index] = updated;
  res.json(updated);
});
app.delete('/api/mosaics/:id', (req, res) => {
  const { id } = req.params;
  database.mosaics = database.mosaics.filter(m => m.id !== parseInt(id));
  res.json({ message: 'Удалено' });
});

app.post('/api/uploads', upload.array('images', 5), (req, res) => {
  const folder = req.body.type || 'objects';
  const files = (req.files || []).map((file) => `/${folder}/${file.filename}`);
  res.json({ files });
});


// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend работает на http://localhost:${PORT}`);
});

