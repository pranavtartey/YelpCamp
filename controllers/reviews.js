const Campground = require('../models/campgrounds')
const Review = require('../models/review');

module.exports.createReview = async(req,res,next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success' , 'Created a new Review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.delete = async (req,res) => {
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log("This is being deleted");
    req.flash('success','Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}