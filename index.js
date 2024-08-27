const baseConfig = require('./config/base.config');
const path = require('path');
const express = require('express')
const cors = require('cors');
const logger = require('./errorHandler/logger');
const error = require('./errorHandler/errorHandler')
const http = require('http'); //socket
const { Server } = require('socket.io'); //socket

const session = require('express-session');
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app); //socket
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:3001",
        origin: "*",
        methods: ["GET", "POST"],
    },
}); //socket
const urlApi = "/api";

global.io = io;

app.use(cors({
    origin: "https://mppdigital.newus.id", // Domain frontend
    credentials: true
}));

app.use(session({
    secret: '4rN=EeE(YS30Paf',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

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

            // res.status(200).json({
            //     status: 'success',
            //     message: 'Login berhasil',
            //     token: req.user.token
            // });

            res.cookie('Authorization', req.user.token, {
                domain: 'mppdigital.newus.id',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                secure: true,
                httpOnly: true,
                sameSite: 'None'
            });

            res.redirect("https://mppdigital.newus.id?token");

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
