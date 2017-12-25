const passportJWT = require("passport-jwt");
const User = require('../models/user');
const debug = require('debug')('server:strategy:jwt');

const { ExtractJwt: { fromAuthHeaderAsBearerToken }, Strategy } = passportJWT;

const jwtOptions = {
  jwtFromRequest: fromAuthHeaderAsBearerToken(),
  secretOrKey: 'tasmanianDevil',
};

const strategy = new Strategy(jwtOptions, async (jwt_payload, next) => {
    debug('payload received', jwt_payload);
    // usually this would be a database call:
    const user = await User.findById(jwt_payload.id);
    debug(`user found ${user._id}`);
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

module.exports = {
  strategy,
  jwtOptions,
};