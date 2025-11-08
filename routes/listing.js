const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const listen = require('../models/listening.js');
const wrapasync = require('../utils/wrapasync.js');
const expresserror = require('../utils/expresserror.js');
const { listingsschema } = require('../schema.js');
const { isloggedin } = require('../middleware.js');


const validatelisting = (req, res, next) => {
  let { error } = listingsschema.validate(req.body);
  console.log("Validation result:", error); 
  
  if(error){
    let errmsg = error.details.map(el => el.message).join(', ');
    throw new expresserror(400, errmsg);
  }
  else{
     next();
  }
};

//index route to display all listings
router.get('/', wrapasync(async (req, res) => {
  const listings = await listen.find({});
  res.render('listings/index', { listings });
}));

//add new listing form
router.get('/new' , isloggedin, (req, res) => {
  res.render('listings/new');
});

//Show individual listing details
router.get("/:id", wrapasync(async (req,res)=>{
  let{id}=req.params;
  let listing = await listen.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    })
    .populate({
      path: 'owner',
      model: 'User'
    });
  if(!listing){
    req.flash('error', 'Listing Not Found!');
    return res.redirect('/listings');
  }
  console.log("Full listing:", listing);
  console.log("Owner info:", listing.owner);
  if (!listing.owner) {
    console.log("No owner found for listing");
  }
  res.render('listings/show',{listing});
}));

//create new listing
router.post("/", isloggedin, validatelisting, wrapasync(async (req,res)=>{
  if (!req.user) {
    req.flash('error', 'You must be logged in to create a listing');
    return res.redirect('/login');
  }
  console.log("Current user:", req.user);
  
  let{title,description,image,price,location,country}=req.body;
  let newListing = new listen({
    title,
    description,
    image,
    price,
    location,
    country,
    owner: req.user._id  // Make sure req.user._id exists
  });
  console.log("New listing before save:", newListing);
  await newListing.save();
  req.flash('success', 'New Listing Created!');

  res.redirect(`/listings`);
}));


//edit listing form
router.get("/:id/edit", isloggedin, wrapasync(async (req,res)=>{
  let {id}=req.params;
  let listing=await listen.findById(id);
  if(!listing){
  req.flash('error', 'Listing Not Found!');
  return res.redirect('/listings');
}
  res.render('listings/edit',{listing});
}));

//update listing
router.put('/:id', isloggedin, wrapasync(async (req,res)=>{
  let {id}=req.params;
  if(!req.body.listening){
     throw new expresserror(400,'Invalid Listing Data');
  }
  await listen.findByIdAndUpdate(id, req.body.listening, { runValidators: true });
  req.flash('success', 'Listing Updated!');
  res.redirect(`/listings`);
}));

//delete listing
router.delete('/:id', isloggedin, wrapasync(async (req,res)=>{
  let {id}=req.params;
  await listen.findByIdAndDelete(id);
  req.flash('success', 'Listing Deleted!');
  res.redirect('/listings');
}));

module.exports = router;