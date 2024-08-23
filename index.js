const baseConfig = require('./config/base.config');
const path = require('path');
const express = require('express')
const cors = require('cors');
const logger = require('./errorHandler/logger');
const error = require('./errorHandler/errorHandler')
const http = require('http'); //socket
const { Server } = require('socket.io'); //socket
const { Userinfo, User, Role, Layanan, Instansi, Permission, Userpermission } = require('./models');

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

app.use(cors());

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

            // return user details
            res.status(200).json({
                status: 'success',
                message: 'Login berhasil',
                token: req.user.token
            });
        } catch (error) {
            console.error("Error in Google authentication callback:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

app.post('/auth/google/token', async (req, res) => {
    try {
      const { idToken } = req.body;
  
      // Verifikasi token Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
  
      const payload = ticket.getPayload();
      const { sub: googleId, name, email, picture } = payload;
  
      // Cek apakah pengguna sudah ada di database berdasarkan email
      let user = await Userinfo.findOne({ where: { email } });
  
      if (!user) {
        // Jika pengguna belum ada, buat pengguna baru
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
        const slug = `${name}-${timestamp}`;
  
        user = await Userinfo.create({
          slug,
          name,
          email,
          fotoprofil: picture
        });
  
        await User.create({
          slug,
          role_id: 5, // Sesuaikan dengan role ID yang sesuai
          userinfo_id: user.id
        });
      }
  
      // Ambil informasi pengguna lengkap
      const userinfo = await Userinfo.findOne({
        where: { email },
        attributes: ['nik', 'email', 'id', 'telepon'],
        include: [
          {
            model: User,
            attributes: ['password', 'id', 'role_id', 'layanan_id', 'instansi_id'],
            include: [
              {
                model: Role,
                attributes: ['id', 'name']
              },
              {
                model: Instansi,
                attributes: ['id', 'name', 'image']
              },
              {
                model: Permission,
                through: Userpermission,
                as: 'permissions'
              },
              {
                model: Layanan,
                attributes: ['id', 'name', 'code', 'slug']
              }
            ],
          }
        ]
      });
  
      // Buat token JWT
      const token = jwt.sign({
        userId: user.id,
        user_akun_id: userinfo.User.id,
        nik: userinfo.nik,
        role: userinfo.User.Role.name,
        instansi: userinfo?.User?.Instansi?.name ?? undefined,
        instansi_id: userinfo?.User?.Instansi?.id ?? undefined,
        instansi_image: userinfo?.User?.Instansi?.image ?? undefined,
        layanan: userinfo?.User?.Layanan?.name ?? undefined,
        layanan_id: userinfo?.User?.Layanan?.id ?? undefined,
        layanan_code: userinfo?.User?.Layanan?.code ?? undefined,
        layanan_slug: userinfo?.User?.Layanan?.slug ?? undefined,
        permission: userinfo.User.permissions.map(permission => permission.name)
      }, baseConfig.auth_secret, { // auth secret
        expiresIn: '24h' // expired 24 jam
      });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error during Google token verification:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

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
