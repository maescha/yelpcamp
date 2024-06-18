const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  }

//render new form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

//create new campgrund
module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Sucessfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//show campground
module.exports.showCampground = async (req, res) => {
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
}

//edit campground
module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

//update campgrund
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Sucessfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//delete
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findById(id);
    req.flash('success', 'Sucessfully deleted campground!');
    res.redirect('/campgrounds');
}
