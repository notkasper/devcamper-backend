const express = require('express');
const {
  getBootCamp,
  createBootcamp,
  deleteBootcamp,
  getBootCamps,
  updateBootcamp,
  getBootcampsInRadius
} = require('../controllers/bootcamps');

const router = express.Router();

router.route('/radius/:zipcode/:distanceKm').get(getBootcampsInRadius);

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
