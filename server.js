require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const roomController = require('./controllers/roomController');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
app.use(express.json());

//connect db
connectDB();

//test route
app.get('/', (req, res) => {
    res.send("ushare backend is da here");
});

//* Room creation route
app.post('/api/rooms/create', roomController.createRoom);

//* device management routes


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});