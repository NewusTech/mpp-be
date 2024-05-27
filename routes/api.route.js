//kode dari file api.route.js

//import route user pada routes\user.route.js
const userRoute = require('./user.route');
const userinfoRoute = require('./userinfo.route');
const roleRoute = require('./role.route');
const instansiRoute = require('./instansi.route');
const layananRoute = require('./layanan.route');
const layananformRoute = require('./layananform.route');

const inputformRoute = require('./inputform.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, userRoute);
    app.use(urlApi, userinfoRoute);
    app.use(urlApi, roleRoute);
    app.use(urlApi, instansiRoute);
    app.use(urlApi, layananRoute);
    app.use(urlApi, layananformRoute);

    app.use(urlApi, inputformRoute);
}