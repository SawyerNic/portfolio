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
mongoose.connect(dbURI).catch((err) => {
    console.log('Could not connect to database');
    throw err;
});

const Content = mongoose.model('Collection', new mongoose.Schema({}, { strict: false }), 'Collection');

app.use(express.json());
app.use(cors());
app.use(express.json()); // <-- Add this line here!

app.get('/api/contents', async (req, res) => {
    console.log('requesting');
    await Content.findByIdAndUpdate(
        '686c8a7a19b92f655a1c5823',
        { lastUpdate: new Date().toString() }
    )
    const doc = await Content.findOne(); // Adjust query as needed
    res.json(doc);
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