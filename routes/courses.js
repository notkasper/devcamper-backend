const express = require('express');
const { getCourses } = require('../controllers/courses');

const router = express.Router();

router.route('/').get(getCourses);

router.route('/:bootcampId').get(getCourses);

module.exports = router;
