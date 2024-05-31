const baseConfig =  require('./config/base.config');

const path = require('path');
const express = require('express')
const error = require('./errorHandler/errorHandler')

const app = express();
const port = 3000;
const urlApi = "/api";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//memanggil route pada routes\api.route.js
require('./routes/api.route')(app,urlApi);
app.use(error)

//listen
app.listen(port, () => {
    console.log(`server is running on port ${port} and url ${baseConfig.base_url}`);
});