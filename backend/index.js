require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require('./src/routes/userRoutes');
const goldRecordRoutes = require('./src/routes/goldRecordRoutes');
const marketRoutes = require('./src/routes/marketRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/gold-records', goldRecordRoutes);
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/market', marketRoutes);

app.get('/', (req, res) => {
    res.send('Gold Accounting API is running...');
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
}

// Vercel Serverless requires exporting the app
module.exports = app;
