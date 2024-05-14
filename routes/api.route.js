//kode dari file api.route.js

//import route user pada routes\user.route.js
const userRoute = require('./user.route');

const blogRoute = require('./blog.route');
const kategoriblogRoute = require('./kategoriblog.route');
const tagblogRoute = require('./tagblog.route');

const kategoriportofolioRoute = require('./kategoriportofolio.route');
const tagportofolioRoute = require('./tagportofolio.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, userRoute);

    app.use(urlApi, blogRoute);
    app.use(urlApi, kategoriblogRoute);
    app.use(urlApi, tagblogRoute);

    app.use(urlApi, kategoriportofolioRoute);
    app.use(urlApi, tagportofolioRoute);
}