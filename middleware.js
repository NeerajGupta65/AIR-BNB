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