const mongoose = require('mongoose');
const debug = require('debug')('server:db');
const config = require('./config');
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useMongoClient: true });

module.exports = mongoose;