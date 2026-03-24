require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const http = require('http');

// Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// File upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io initialization
const socketIo = require('./socket').init(server);
socketIo.on('connection', socket => {
    console.log('Client connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`API Gateway Server running on port ${PORT}`);
    console.log('Restarted successfully');
});
