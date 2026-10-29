require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const roomController = require('./controllers/roomController');
const deviceRoutes = require('./routes/deviceRoutes');
const pairingRoutes = require('./routes/pairingRoutes');
const itemRoutes = require('./routes/itemRoutes');
const startCleanupTask = require('./utils/cleanupCron');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//connect db
connectDB();
startCleanupTask();

//test route
app.get('/', (req, res) => {
    res.send("ushare backend is da here");
});

//* Room creation route
app.post('/api/rooms/create', roomController.createRoom);

//* device management routes
app.use('/api/devices', deviceRoutes);

//* device pairing routes
app.use('/api/pairing', pairingRoutes);

//* items-sharing routes
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});