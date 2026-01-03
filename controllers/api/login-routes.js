const router = require('express').Router();
const User = require('../../models/userSchema');

let hbsContent = {
    userName: '',
    loggedin: false,
    title: "You are not logged in today",
    body: "Hello World"
};

// Middleware: check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard'); // already logged in, go to dashboard
    } else {
        next();
    }    
};

// Root: redirect to login
router.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

// ----------------- SIGNUP -----------------
router.get('/signup', (req, res) => {
    res.render('signup', hbsContent);
});

router.post('/signup', async (req, res) => {
    try {
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        req.session.user = user.dataValues;
        hbsContent.loggedin = true;
        hbsContent.userName = user.username;
        hbsContent.title = "You are logged in";
        console.log('Signup successful:', user.username);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Signup failed:', error);
        req.session.message = {
            type: 'danger',
            intro: 'Signup failed! ',
            message: 'Please try again.'
        };
        res.redirect('/signup');
    }
});

// ----------------- LOGIN -----------------
router.get('/login', sessionChecker, (req, res) => {
    res.render('login', hbsContent);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.session.message = {
                type: 'danger',
                intro: 'User does not exist! ',
                message: 'Please go to our SignUp Page.'
            };
            return res.redirect('/login');
        }

        if (!user.validPassword(password)) {
            req.session.message = {
                type: 'danger',
                intro: 'Password and Email do not match! ',
                message: 'Please check your credentials.'
            };
            return res.redirect('/login');
        }

        req.session.user = user.dataValues;
        hbsContent.loggedin = true;
        hbsContent.userName = user.username;
        hbsContent.title = "You are logged in";

        console.log('Login successful:', user.username);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login');
    }
});

// ----------------- DASHBOARD -----------------
router.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        hbsContent.loggedin = true;
        hbsContent.userName = req.session.user.username;
        hbsContent.title = "You are logged in";
        res.render('index', hbsContent);
    } else {
        res.redirect('/login');
    }
});

// ----------------- LOGOUT -----------------
router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        hbsContent.loggedin = false;
        hbsContent.title = "You are logged out!";
        res.clearCookie('user_sid');
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
