const baseConfig = require('./config/base.config');
const path = require('path');
const express = require('express')
const cors = require('cors');
const { Expo } = require('expo-server-sdk');
const logger = require('./errorHandler/logger');
const error = require('./errorHandler/errorHandler')
const http = require('http'); //socket
const { Server } = require('socket.io'); //socket

const session = require('express-session');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const app = express();
const expo = new Expo();
const server = http.createServer(app); //socket

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
}); //socket

const urlApi = "/api";

global.io = io;

app.use(cors());

app.use(session({
    secret: '4rN=EeE(YS30Paf',
    resave: false,
    saveUninitialized: true
}));

let savedPushTokens = [];
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

// notif mobile 

const saveToken = (token) => {
    if (savedPushTokens.indexOf(token) === -1) {
        savedPushTokens.push(token);
    }
};

app.post('/tokens', (req, res) => {
    saveToken(req.body.token);
    res.send('Token saved');
});

// Endpoint untuk mengirim push notification ketika status berubah
app.post('/sendNotification', async (req, res) => {
    const { message, status } = req.body;

    const notifications = savedPushTokens.map((pushToken) => ({
        to: pushToken,
        sound: 'default',
        body: message,
        data: { status },
    }));

    let chunks = expo.chunkPushNotifications(notifications);
    let tickets = [];

    (async () => {
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    })();

    res.send('Notifications sent');
});

// Routes
app.get('/auth/google', async (req, res, next) => {
    try {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    } catch (error) {
        console.error('Error during Google authentication:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        scope: ["email", "profile"],
    }),
    (req, res) => {
        try {
            if (!req.user) {
                return res.status(400).json({ error: "Authentication failed" });
            }

            const token = req.user.token;
            res.send(`
                <script>
                    window.opener.postMessage({ token: '${token}' }, '${process.env.WEBSITE_URL}');
                    window.close();
                </script>
            `);

        } catch (error) {
            console.error("Error in Google authentication callback:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//memanggil route pada routes\api.route.js
require('./routes/api.route')(app, urlApi);

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
server.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT} and url ${baseConfig.base_url}`);
});
