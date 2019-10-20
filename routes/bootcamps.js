const express = require('express');
const {
  getBootCamp,
  createBootcamp,
  deleteBootcamp,
  getBootCamps,
  updateBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const { protect } = require('../middleware/auth');
// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distanceKm').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootCamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;
