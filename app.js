if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config({});
}
// console.log(process.env.SECRET);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const slugify = require('slugify');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressErrors');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
// process.env.DB_URL;
// 'mongodb://localhost:27017/yelp-camp'
const app = express();
console.log(process.env.NODE_ENV)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('Database Connected');
});
const secret = process.env.SECRET ||'thisshouldbebettersecret';
const store = MongoStore.create ({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24 * 60 * 60,
})

store.on('error',function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        // secure : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs',ejsMate);

app.use((req,res,next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req,res) => {
    const user = new User({email : 'colt@gmail.com', username : 'Colttt'});
    const newUser = await User.register(user , 'chicken');
    res.send(newUser);
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res) =>{
    res.render('campgrounds/home');
})

app.all('*',(req,res,next) => {
    console.log('hello form the error');
    next(new ExpressError('Page not found',404));
})

app.use((err,req,res,next) => {
    const {statusCode = 500 } = err;
    if(!err.message) error.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error',{ err });
})

// console.log(slugify('Fresh Avacados' , {lower : true}));
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Connected on port ${port}`);
})
//https://powerful-journey-53386.herokuapp.com/campgrounds

//https://powerful-journey-53386.herokuapp.com/

//https://powerful-journey-53386.herokuapp.com/campgrounds

//DB_URL=mongodb+srv://pranavtartey:wwXC7YR9W7H5J3BA@cluster0.ugegucg.mongodb.net/?retryWrites=true&w=majority