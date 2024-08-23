const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const baseConfig = require('../config/base.config');
const { Userinfo, User, Role, Layanan, Instansi, Permission, Userpermission } = require('../models');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Cek apakah user sudah ada di database berdasarkan email
        console.log(profile)
        let user = await Userinfo.findOne({ where: { email: profile.emails[0].value } });

        if (!user) {
            const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
            const slug = `${profile.displayName}-${timestamp}`;

            user = await Userinfo.create({
                slug: slug,
                name: profile.displayName,
                email: profile.emails[0].value,
                fotoprofil: profile.photos[0].value
            });

            await User.create({
                slug: slug,
                role_id: 5,
                userinfo_id: user.id,
            });
        }

        let userinfo = await Userinfo.findOne({
            where: { email: profile.emails[0].value },
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
                },
            ],
        });

        let token = jwt.sign({
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
            // permissions: userinfo?.User?.permissions,
            permission: userinfo.User.permissions.map(permission => permission.name)
        }, baseConfig.auth_secret, { // auth secret
            expiresIn: 864000 // expired 24 jam
        });

        return done(null, { token: token });
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
