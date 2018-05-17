'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const config = require('./config');
const healthCheck = require('express-healthcheck');
const pkg = require('./package');
const bodyParser = require('body-parser');

//-------------------------------------
//
// setup the app
//
//-------------------------------------
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//-------------------------------------
//
// we are using json for everything that this service handles
//
//-------------------------------------
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.set('Content-Type', 'application/json');
    next();
});

//-------------------------------------
//
// setup some routes for us to hit
//
//-------------------------------------
app.use('/', function (req, res, next) {
    const remoteAddress = req.connection.remoteAddress;
    const hostName = os.hostname();
    res.status(200).json({ remoteAddress, hostName });
});

app.use(`/${config.get('POD_ENDPOINT')}`, function (req, res, next) {
    const remoteAddress = req.connection.remoteAddress;
    const hostName = os.hostname();
    res.status(200).json({ remoteAddress, hostName });
});

//-------------------------------------
//
// other helpful routes when working with kubernetes
//
//-------------------------------------
app.use('/healthcheck', healthCheck());
app.use('/readiness', function (req, res, next) {
    res.status(200).json({ ready: true });
});
app.get('/version', function (req, res, next) {
    const version = pkg.version;
    res.status(200).json({ version });
});

//-------------------------------------
//
// catch 404 and forward to error handler
//
//-------------------------------------
app.use(function (req, res, next) {
    next(createError(404));
});

//-------------------------------------
//
// error handler
//
//-------------------------------------
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    err.response = {
        message: err.message,
        internalCode: err.code
    };
    // render the error page
    res.status(err.status || 500).json(err.response);
});

module.exports = app;