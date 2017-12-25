const _ = require('lodash');
const config = require('../config');
const MovieDB = require('moviedb')(config.movieDBApiKey);
const { promisify } = require('util');
const mongoose = require('mongoose');
const debug = require('debug')('server:model:movie');

const MovieSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
  },
  poster_path: String,
  backdrop_path: String,
  overview: String,
  original_title: String,
});

const Movie = mongoose.model('Movie', MovieSchema);

const searchMovie = promisify(MovieDB.searchMovie.bind(MovieDB));
const discoverMovie = promisify(MovieDB.discoverMovie.bind(MovieDB));
const configuration = promisify(MovieDB.configuration.bind(MovieDB));
const movieInfo = promisify(MovieDB.movieInfo.bind(MovieDB));

let movieDBConfiguration = null;

const parseMovie = (movie) => {
  return _.pick(movie, ['poster_path', 'backdrop_path', 'overview', 'id', 'original_title'])
};

const parseConfiguration = (configuration) => {
  return _.pick(configuration, ['images']);
};

module.exports = {
  async findByMovieDBId(id) {
    debug(`looking for movie with id '${id}; in db`);
    let movie = await Movie.findOne({ id });
    if (!movie) {
      debug(`can not found movie with id '${id}' in db, start looking in movieDB`);
      const data = await movieInfo({ id });
      if (!data) {
        debug(`can not found movie with id '${id}' in movieDB`);
        const e = new Error('Not found');
        e.status = 404;
        throw e;
      }

      movie = new Movie(parseMovie(data));

      debug(`save in local db movie with id '${id}'`);
      await movie.save();
    }
    debug(`returning movie with id '${id}'`);
    return movie;
  },
  async findByName(name) {
    const { results } = await searchMovie({ query: name });
    return results.map(parseMovie);
  },
  async discoverMovie() {
    const { results } = await discoverMovie();
    return results.map(parseMovie);
  },
  async configuration() {
    if (!movieDBConfiguration) {
      movieDBConfiguration = parseConfiguration(await configuration());
    }
    return movieDBConfiguration;
  },
  parseMovie,
};