const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const Campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping'});
//     await camp.save();

//     res.send(camp)
// })

//PLEASE NOTE THAT PLACEMENT MATTERS FOR URLS

//renders all randomly generated campgrounds onto the 'main' page
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

//creating new campgrounds
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

//setting up the endpoint where created data will be send to
app.post('/campgrounds', async(req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})


//details page for selected campground
app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground})
})

//edit campground details page
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground})
})

//handles sending the inputted data to server to update database
app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
})

//delete campground
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})