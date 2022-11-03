const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const db = require('./data/database');
const blogRoutes = require('./routes/blog');
const homeRoutes = require('./routes/home');
const { userInfo } = require('os');

const app = express();

const store = new MongoDBStore({
  uri: 'mongodb+srv://blog-user-1:blogDBUser1@cluster0.kc3h8lg.mongodb.net/posts?retryWrites=true&w=majority',
  databaseName: 'blog',
  collection: 'sessions',
});

// Catch errors
store.on('error', function (error) {
  console.log('there is an error: ', error);
});

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.json()); // parse incoming json (FOR Ajax Posts)
app.use(express.static('public')); // Serve static files (e.g. CSS files)

// Session
app.use(
  session({
    secret: 'MyBlog-Super-Secret-1-Key', // a secret key (use longer in projects)
    resave: false, // session only updated in database if the data has changed
    saveUninitialized: false, // only save session into database once some data is in it
    store: store, // where session data will be stored
    cookie: {
      maxAge: 3 * 60 * 60 * 1000, // session expires in 2 hours
    },
  })
); // middleware function

app.use(async function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next(); // move on to next middleware
  }

  const userDoc = await db
    .getDB()
    .collection('users')
    .findOne({ _id: user.id });

  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;

  next();
});

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(homeRoutes);
app.use(blogRoutes);

db.connectToDB().then(function () {
  app.listen(3000);
});
