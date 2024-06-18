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
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground.');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground, title: campground.title });
}));

//edit campground details page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground })
}));

//handles sending the inputted data to server to update database
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Sucessfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}));

//delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findById(id);
  req.flash('success', 'Sucessfully deleted campground!');
  res.redirect('/campgrounds');
}));

module.exports = router;