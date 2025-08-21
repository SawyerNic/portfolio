require('dotenv').config();

const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Server configuration
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURI = process.env.MONGODB_URI;

const app = express();
app.use(cors());

// Connect to database
mongoose.connect(dbURI, { useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('Could not connect to database:', err.message);
        process.exit(1);
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});



const Content = mongoose.model('Collection', new mongoose.Schema({}, { strict: false }), 'Content');

app.use(express.json());
app.use(cors());
app.use(express.json()); // <-- Add this line here!

app.get('/api/collections', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json(collections.map(col => col.name));
    } catch (err) {
        console.error('Error listing collections:', err);
        res.status(500).json({ error: 'Failed to list collections' });
    }
});

app.get('/api/contents', async (req, res) => {
    console.log('requesting');
    await Content.findByIdAndUpdate(
        '686c8a7a19b92f655a1c5823',
        { lastUpdate: new Date().toString() }
    )
    const doc = await Content.findOne(); // Adjust query as needed
    res.json(doc);
});

app.post('/api/contents', async (req, res) => {
    try {
        const updated = await Content.findByIdAndUpdate(
            '686c8a7a19b92f655a1c5823',
            req.body,
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        console.error('Error writing object:', err);
        res.status(500).json({ error: 'Failed to write object' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (
        username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASS
    ) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.use(express.static(__dirname));

app.listen(port, () => console.log(`API running on 3000`));