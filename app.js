const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsmate = require('ejs-mate');
const methodOverride = require('method-override');
const expresserror = require('./utils/expresserror.js');
const joi = require('joi');
const sessions = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const sessionConfig = {
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};



app.use(sessions(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get('/', (req, res) => {
  res.redirect('/listings');
});

const reviews = require('./routes/review.js');
const lisiting = require('./routes/listing.js'); // Should be "listing"


main()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
}

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});

app.use('/', userRoutes);
app.use('/listings', lisiting);
app.use('/listings/:id/reviews', reviews);



app.use((req,res,next)=>{
  next(new expresserror(404,'Page Not Found'));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
