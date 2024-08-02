const baseConfig =  require('./config/base.config');
const path = require('path');
const express = require('express')
const cors = require('cors');
const logger = require('./errorHandler/logger');
const error = require('./errorHandler/errorHandler')
const http = require('http'); //socket
const socketIo = require('socket.io'); //socket

const app = express();
const server = http.createServer(app); //socket
const io = socketIo(server); //socket
const port = 3000;
const urlApi = "/api";

global.io = io;

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//memanggil route pada routes\api.route.js
require('./routes/api.route')(app,urlApi);

app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({ error: err.message });
});

app.use(error)

app.use('/static', express.static('public'))

//socket
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

//listen
app.listen(port, () => {
    console.log(`server is running on port ${port} and url ${baseConfig.base_url}`);
});
