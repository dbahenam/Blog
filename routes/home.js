const express = require('express');
const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');

const router = express.Router();

// database to work with
const db = require('../data/database');
const ObjectId = mongodb.ObjectId;

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/signup', function (req, res) {
  // save session inputData
  let sessionInputData = req.session.inputData;

  // if falsy, create empty object
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      message: '',
      email: '',
      confirmEmail: '',
      password: '',
    };
  }

  req.session.inputData = null; // clear data

  res.render('signup', { inputData: sessionInputData });
});

router.post('/signup', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData['user-email'];
  const enteredConfirm = userData['user-confirm'];
  const enteredPassword = userData.password;

  if (
    !enteredEmail ||
    !enteredConfirm ||
    enteredPassword.trim() < 6 || // remove blank spaces
    enteredEmail !== enteredConfirm ||
    !enteredEmail.includes('@')
  ) {
    req.session.inputData = {
      hasError: true,
      message: 'Invalid input - please check your data.',
      email: enteredEmail,
      confirmEmail: enteredConfirm,
      password: enteredPassword,
    };
    req.session.save(function () {
      return res.redirect('/signup');
    });
    return;
  }

  // check if email exists already
  const userExists = await db
    .getDB()
    .collection('users')
    .findOne({ email: enteredEmail });

  if (userExists) {
    req.session.inputData = {
      hasError: true,
      message: 'A user with that email address exists already.',
      email: enteredEmail,
      confirmEmail: enteredConfirm,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect('/signup');
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(enteredPassword, 12); // 12 --> how strong decoded
  const newUser = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDB().collection('users').insertOne(newUser);

  res.redirect('/login');
});

router.get('/login', function (req, res) {
  // save session inputData
  let sessionInputData = req.session.inputData;

  // if falsy, create empty object
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      message: '',
      email: '',
      confirmEmail: '',
      password: '',
    };
  }

  req.session.inputData = null; // clear data

  res.render('login', { inputData: sessionInputData });
});

router.post('/login', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData['user-email'];
  const enteredPassword = userData['user-password'];

  const existingUser = await db
    .getDB()
    .collection('users')
    .findOne({ email: enteredEmail });

  const passwordFlag = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  // if email doesn't exist
  if (!existingUser || !passwordFlag) {
    req.session.inputData = {
      hasError: true,
      message: 'Email or password is incorrect.',
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect('/login');
    });
    return;
  }

  if (!passwordFlag) {
    console.log('Incorrect password. Try again');
    return res.redirect('/login');
  }

  // creating user session
  req.session.user = { id: existingUser._id, email: existingUser.email };
  req.session.isAuthenticated = true;

  // check if is admin

  // Check the user "ticket"
  if (!req.session.isAuthenticated) {
    // access denied
    return res.status(401).render('401');
  }

  return res.redirect('/posts'); // only executed once save is complete
});

router.post('/logout', function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect('/');
});

module.exports = router;
