const Listing = require('./models/listening');
const Review = require('./models/review');
const expresserror = require('./utils/expresserror');
const {listingsschema,reviewschema} = require('./schema');

module.exports.isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirecturl=req.originalUrl;
        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveredirecturl=(req,res,next)=>{
    if(req.session.redirecturl){
        res.locals.redirecturl=req.session.redirecturl;
    }
    next();
};

module.exports.isowner= async (req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
  if(req.user && !listing.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to edit this listing');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validatelisting=(req,res,next)=>{
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

module.exports.validatereview=(req,res,next)=>{
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

    module.exports.isreviewauthor= async (req,res,next)=>{
    let {id, reviewId}=req.params;
    let review=await Review.findById(reviewId);
  if(req.user && !review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to edit this review');
    return res.redirect(`/listings/${id}`);
  }
  next();
};