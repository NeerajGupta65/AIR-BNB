const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const listen = require('../models/listening.js');
const Review = require('../models/review.js');
const wrapasync = require('../utils/wrapasync.js');
const expresserror = require('../utils/expresserror.js');
const { isloggedin } = require('../middleware.js');
const { reviewschema } = require('../schema.js');


const validatereview = (req, res, next) => {
  let { error } = reviewschema.validate(req.body.review);
  console.log("Validation result:", error); 
  
  if(error){
    let errmsg = error.details.map(el => el.message).join(', ');
    throw new expresserror(400, errmsg);
  }
  else{
     next();
  }
};

//review routes

router.post('/', isloggedin, validatereview, wrapasync(async (req, res) => {
  let listing = await listen.findById(req.params.id);
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;  // Set the author to the current user
  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  req.flash('success', 'New Review Created!');
  res.redirect(`/listings/${listing._id}`);
}));

//DELETE review
router.delete('/:reviewId', isloggedin, wrapasync(async (req, res) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to delete this review');
    return res.redirect(`/listings/${id}`);
  }
  await listen.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review Deleted!');
  res.redirect(`/listings/${id}`);
}));

module.exports = router;