const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const {campgroundSchema, reviewSchema} = require('./schemas.js');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const Campground = require('./models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//tells express to parse the body
app.use(express.urlencoded({extended:true}));

app.use(methodOverride('_method'));

//middleware that validates campground model/schema
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//validates reviewSchema
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
        } else {
            next();
        }
}

app.get('/', (req, res) => {
    res.render('home')
})

//411. making a basic model to check whether or not the app works
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: 'my backyard', description: 'cheap camping'});
    await camp.save();

    res.send(camp)
})

//PLEASE NOTE THAT PLACEMENT MATTERS FOR URLS

//renders all randomly generated campgrounds onto the 'main' page
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

//creating new campgrounds
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

//setting up the endpoint where created data will be send to
app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//details page for selected campground, will also display reveiws
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {campground})
}));

//edit campground details page
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground})
}));

//handles sending the inputted data to server to update database
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}));

//delete campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

//getting the reviews to submit and show on page
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);

    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//deleting reviews
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;

    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`)
}))

// incorrect urls go to 404 page
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error handling
app.use((err, req, res, next) => {
    const{statusCode = 500} = err;

    if(!err.message) err.message = 'Oh no, something went wrong!';

    res.status(statusCode).render('errors', {err});
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
})