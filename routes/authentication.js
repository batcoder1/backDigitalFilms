const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { jwtOptions } = require('../strategies/jwt');
const debug = require('debug')('server:router:user');
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const { compare }= require('bcrypt');

/* GET home page. */
router.post('/login', [
  body('username').exists(),
  body('password').exists(),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  const { username, password } = matchedData(req);

  // usually this would be a database call:
  debug(`looking for user ${username}`);
  const user = await User.findByName(username);
  if( !user ){
    return res.status(401).json({ message:'no such user found' });
  }

  debug('comparing password with stored user');
  const match = compare(password, user.password);
  if(match) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    const payload = { id: user._id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey);
    return res.json({ message: 'ok', token: token });
  }
  return res.status(401).json({ message:'passwords did not match' });
});

module.exports = router;
