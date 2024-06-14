const express = require('express');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware.js')

const router = express.Router();


//middleware that validates campground model/schema
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

//renders all randomly generated campgrounds onto the 'main' page
router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

//creating new campgrounds
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

//setting up the endpoint where created data will be send to
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Sucessfully made a new campground!');

  res.redirect(`/campgrounds/${campground._id}`);
}));

//details page for selected campground, will also display reveiws
router.get('/:id', catchAsync(async (req, res) => {
  if (req.params.id.length !== 24) {
    req.flash('error', 'Cannot find that campground.');
    return res.redirect('/campgrounds');
  }
  const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground.');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground, title: campground.title });
}));

//edit campground details page
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground })
}));

//handles sending the inputted data to server to update database
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Sucessfully updated campground!');

  res.redirect(`/campgrounds/${campground._id}`)
}));

//delete campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

module.exports = router;