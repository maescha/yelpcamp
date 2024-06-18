const express = require('express');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js')
const campgrounds = require('../controllers/campgrounds.js');

const router = express.Router();

//renders all randomly generated campgrounds onto the 'main' page
router.get('/', catchAsync(campgrounds.index));

//creating new campgrounds
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

//setting up the endpoint where created data will be send to
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//details page for selected campground, will also display reveiws
router.get('/:id', catchAsync(campgrounds.showCampground));

//edit campground details page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm));

//handles sending the inputted data to server to update database
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;