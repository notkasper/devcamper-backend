const express = require('express');
const {
  getBootCamp,
  createBootcamp,
  deleteBootcamp,
  getBootCamps,
  updateBootcamp
} = require('../controllers/bootcamps');

const router = express.Router();

router
  .route('/')
  .get(getBootCamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
