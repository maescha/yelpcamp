const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const Campground = require('./models/campground');

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
app.post('/campgrounds', catchAsync(async(req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    //this will validate our schema before we send it to Mongoose
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    });

    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    console.log(result);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//details page for selected campground
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground})
}));

//edit campground details page
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground})
}));

//handles sending the inputted data to server to update database
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
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