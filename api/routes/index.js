const router = require('express').Router();

const author = require('./author');
const book = require('./book');
const genre = require('./genre');
const user = require('./users');
const review = require('./reviews');

router.use('/authors', author);
router.use('/books', book);
router.use('/genres', genre);
router.use('/users', user);
router.use('/reviews', review);

// handle validation error messages
//    TODO: verify
router.use((req, res, err, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;
        return errors;
      }, {}),
    });
  }
  return next(err);
});

module.exports = router;
