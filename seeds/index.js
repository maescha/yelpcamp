const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const { v4: uuidv4 } = require('uuid');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//pass in the array and return a (random) element from that array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6670b4b0e98c5432187dce07',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `https://picsum.photos/seed/${uuidv4()}/500/500`,
            images:  [
                {
                  url: 'https://res.cloudinary.com/dsns0avdz/image/upload/v1719444142/YelpCamp/qoks0vvmzw5puvyyenax.jpg',
                  filename: 'YelpCamp/qoks0vvmzw5puvyyenax'
                },
                {
                  url: 'https://res.cloudinary.com/dsns0avdz/image/upload/v1719444142/YelpCamp/uqm7lrzg1f3ivcssjcow.jpg',
                  filename: 'YelpCamp/uqm7lrzg1f3ivcssjcow'
                }
                ],
            description: 'Amet adipisicing reprehenderit proident duis commodo ad id nisi dolore proident.',
            price,
            geometry: {
                type: "Point",
                coordinates: [16.62662018, 49.2125578],
              },
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
