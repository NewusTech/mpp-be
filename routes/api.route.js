const userRoute = require('./user.route');
const userinfoRoute = require('./userinfo.route');
const roleRoute = require('./role.route');
const artikelRoute = require('./artikel.route');
const dashboardRoute = require('./dashboard.route');
const statistikRoute = require('./statistik.route');
const faqRoute = require('./faq.route');
const kecamatanRoute = require('./kecamatan.route');
const desaRoute = require('./desa.route');
const visimisiRoute = require('./visimisi.route');
const facilitiesRoute = require('./facilities.route');
const carouselRoute = require('./carousel.route');
const instansiRoute = require('./instansi.route');
const antrianRoute = require('./antrian.route');
const layananRoute = require('./layanan.route');
const layananformRoute = require('./layananform.route');
const surveyformRoute = require('./surveyform.route');

const suratRoute = require('./surat.route');
const inputformRoute = require('./inputform.route');
const inputsurveyRoute = require('./inputsurvey.route');
const historyformRoute = require('./historyform.route');

module.exports = function (app, urlApi) {
    app.use(urlApi, userRoute);
    app.use(urlApi, userinfoRoute);
    app.use(urlApi, roleRoute);
    app.use(urlApi, artikelRoute);
    app.use(urlApi, faqRoute);
    app.use(urlApi, desaRoute);
    app.use(urlApi, kecamatanRoute);
    app.use(urlApi, visimisiRoute);
    app.use(urlApi, dashboardRoute);
    app.use(urlApi, statistikRoute);
    app.use(urlApi, facilitiesRoute);
    app.use(urlApi, carouselRoute);
    app.use(urlApi, instansiRoute);
    app.use(urlApi, antrianRoute);
    app.use(urlApi, layananRoute);
    app.use(urlApi, layananformRoute);

    app.use(urlApi, suratRoute);
    app.use(urlApi, surveyformRoute);
    app.use(urlApi, inputformRoute);
    app.use(urlApi, inputsurveyRoute);
    app.use(urlApi, historyformRoute);
}