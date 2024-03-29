const express = require('express');
const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
// newsletter
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

app.engine('handlebars', engine({
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	defaultLayout: 'main' // Specify default template views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');

const helpers = require('./helpers/handlebars');
app.engine('handlebars', engine({
	helpers: helpers,
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	defaultLayout: 'main' // Specify default template views/lay-out/ main.handlebar
}));
app.set('view engine', 'handlebars');

///
// var expressHbs =  require('express-handlebars');
// var hbs= expressHbs.create({});
Handlebars.registerHelper('if_equal', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this)
    } else {
        return opts.inverse(this)
    }
})
///

// Express middleware to parse HTTP body in order to read HTTP data
app.use(express.urlencoded({
	extended: false
}));
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser('your secret option here'));

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true,
	// The maximum age of a valid session; milliseconds:
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds:
	checkExpirationInterval: 1800000 // 30 min
};


// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	// secret: 'tojdiv',
	secret: process.env.APP_SECRET,
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

// Bring in database connection
const DBConnection = require('./config/DBConnection');
// Connects to MySQL database
DBConnection.setUpDB(false); // To set up database with new tables
// (true)

DBConnection.setUpDB(process.env.DB_RESET == 1); // To set up database with new tables (true)

const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
app.use(flashMessenger.middleware);

// Passport Config
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);
passportConfig.localStrategy2(passport);

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Place to define global variables
app.use(function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// mainRoute is declared to point to routes/main.js
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const staffRoute = require('./routes/staff');
const quizRoute = require('./routes/quiz');
const cartRoute = require('./routes/cart');
const productRoute = require('./routes/product');
const bookingRoute = require('./routes/booking');
const voucherRoute = require('./routes/voucher');
const paymentRoute = require('./routes/payment');
const subscriptionRoute = require('./routes/subscription');
const newsletterRoute = require('./routes/newsletter');

// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use('/', mainRoute);
app.use('/user', userRoute);
app.use('/staff', staffRoute);
app.use('/quiz', quizRoute);
app.use('/cart', cartRoute);
app.use('/product', productRoute);
app.use('/booking', bookingRoute);
app.use('/voucher', voucherRoute);
app.use('/subscription', subscriptionRoute);
app.use('/payment', paymentRoute);
app.use('/newsletter', newsletterRoute);

/*
* Creates a port for express server since we don't want our app to clash with well known
* */

// const port = 5000;
// const port = process.env.PORT;

const port = process.env.PORT;

// Starts the server and listen to port
app.listen(port, ()=> {
	console.log(`Server started on port ${port}`);
});