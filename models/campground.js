const mongoose = require('mongoose');
const Review = require('./review');

const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//campground delete middleware- ensures that reviews are deleted with campground
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        //this doc has reviews and (we) want to delete all reviews where their _id field is $in our doc that was just deleted in its reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);