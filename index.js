/**
 * Created by Alex Zalewski on 10/08/2015.
 */

var express = require('express'),
    exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook'),
    mongoose = require('mongoose');

var User = require('./app/models/user');


// We Will be creating these two files shortly
var config = require('./config.js'), //config file contains all tokens and other private info

funct = require('./functions.js'); // funct file contains our helper functions for our Passport and database work
var app = express();


//======PASSPORT=======
passport.use(new TwitterStrategy({
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        callbackURL: 'http://127.0.0.1:5000/login/twitter/return'
    },
    function(token, tokenSecret, profile, cb) {
        // In this example, the user's Twitter profile is supplied as the user
        // record.  In a production-quality application, the Twitter profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        return cb(null, profile);
    }));
//Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP request, Passport needs to
// serialize users into and deserialize users out of the session. In a
// production-quality application, this would typically be as simple as supplying
// the user ID when serializing and querying the user record by ID
// from the database when deserializing. However, due to the fact that this
//example does not have a DB, the complete Twitter profile is serialized and
// deserialized

passport.serializeUser(function (user, done) {
    console.log("serializing " + user.username);
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    console.log("deserializing " + obj);
    done(null, obj);

});

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.error = 'Please sign in!';
    res.redirect('/signin');
}


passport.use('local-signin', new LocalStrategy(
    {passReqToCallback: true},
    function (req, username, password, done) {
        funct.localAuth(username, password)
            .then(function (user) {
                if (user) {
                    console.log("Logged in as: ", user.username);
                    req.session.success = 'You are successfully logged in ' + user.username + '!';
                    done(null, user);

                }
            })
            .fail(function (err) {
                console.log(err.body);

            });

    }
));


passport.use('local-signup', new LocalStrategy(
    {passReqToCallback: true},
    function (req, username, password, done) {
        funct.localReg(username, password, req.body.avatar)
            .then(function (user) {
                if (user) {
                    console.log("Registered: " + user.username);
                    req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
                    done(null, user);

                }
                if (!user) {
                    console.log("Could not register");
                    req.session.error = 'That username is already in use, please try a different one.';
                    done(null, user);

                }
            })
            .fail(function (err) {
                console.log(err.body);

            });

    }
));


//======EXPRESS=========
//Configure Express

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//Session-persisted message Middleware

app.use(function(req, res, next){
    var err=req.session.error,
        msg=req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});


var hbs = exphbs.create({
    defaultLayout: 'main'
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//========Routes=========
//displays our homepage

//===============ROUTES=================
//displays our homepage
app.get('/', function(req, res){
    res.render('home', {user: req.user});
});

//displays our signup page
app.get('/signin', function(req, res){
    res.render('signin');
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signin'
    })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/',
        failureRedirect: '/signin'
    })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
    var name = req.user.username;
    console.log("LOGGIN OUT " + req.user.username);
    req.logout();
    res.redirect('/');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/login/twitter/return',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/profile');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user });
    });

//========END ROUTES=======

var port = process.env.PORT || 5000;

app.listen(port);

console.log("listening on " + port + "!");


