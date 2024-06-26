const express = require('express');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js')
const campgrounds = require('../controllers/campgrounds.js');
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

const router = express.Router();

router.route('/')
    //renders all randomly generated campgrounds onto the 'main' page
    .get(catchAsync(campgrounds.index))
    //setting up the endpoint where created data will be send to
    .post(isLoggedIn, upload.array('campgroundImg'), validateCampground, catchAsync(campgrounds.createCampground));

//creating new campgrounds
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //details page for selected campground, will also display reveiws
    .get(catchAsync(campgrounds.showCampground))
    //handles sending the inputted data to server to update database
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    //delete campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


//edit campground details page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm));

module.exports = router;