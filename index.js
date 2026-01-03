const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const hbs = require('express-handlebars'); 
const path = require('path'); 
const flash = require('connect-flash');
const router = require('./controllers'); // loginController

const PORT = process.env.PORT || 3001;

const app = express();

// Logging
app.use(morgan('dev'));
app.use(flash());

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cookie parser
app.use(cookieParser());

// Session setup
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 } // 10 minutes
}));

// Handlebars setup
const handlebars = hbs.create({ extname: '.hbs' });
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Clear cookie if session is gone
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Mount controller at root
app.use('/', router);

// 404 fallback
app.use((req, res) => {
    res.status(404).send("Sorry, page not found!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
