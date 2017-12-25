const express = require('express');
const router = express.Router();
const Movies = require('../models/movies');
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const debug = require('debug')('server:router:movies');

/* GET movies. */

router.param('movieDBId', async (req, res, next, id) => {
  try {
    const movie = await Movies.findByMovieDBId(id);
    debug('got the movie', movie);
    if (!movie) {
      const e = new Error('not found');
      e.status = 404;
      return next(e);
    }
    req.movie = movie;
    return next();
  } catch (e) {
    e.status = 500;
    return next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const movies = await Movies.discoverMovie();
    res.json({ movies });
  } catch (e) {
    next(e);
  }
});

router.get('/:movieDBId(\\d+)', async (req, res) => {
  return res.json({ movie: req.movie })
});

router.get('/configuration', async (req, res, next) => {
  try {
    const configuration = await Movies.configuration();
    res.json(configuration);
  } catch (e) {
    next(e);
  }
});

router.post('/search', [
  body('name').exists()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ message: 'Invalid data', mapped: errors.mapped(), status: 422});
  }

  const { name } = matchedData(req);
  debug(`looking for movie with name '${name}'`);
  try {
    const movies = await Movies.findByName(name);
    res.json({ movies });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
