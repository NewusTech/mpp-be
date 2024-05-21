//kode dari file api.route.js

//import route user pada routes\user.route.js
const userRoute = require('./user.route');
const roleRoute = require('./role.route');
const instansiRoute = require('./instansi.route');
const layananRoute = require('./layanan.route');
const layananformRoute = require('./layananform.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, userRoute);
    app.use(urlApi, roleRoute);
    app.use(urlApi, instansiRoute);
    app.use(urlApi, layananRoute);
    app.use(urlApi, layananformRoute);
}