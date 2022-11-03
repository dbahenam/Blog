const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// database to work with
const db = require('../data/database');
const ObjectId = mongodb.ObjectId;

// router.get('/', async function (req, res) {
//   res.redirect('/posts');
// });

router.get('/posts', async function (req, res) {
  //   console.log("made it to get route posts");
  const posts = await db.getDB().collection('posts').find().toArray();
  res.render('post-list', { posts: posts });
});

router.get('/new-post', function (req, res) {
  res.render('create-post');
});

router.post('/new-post', async function (req, res) {
  const authorName = req.body.author;
  let authorId;
  let author = await db
    .getDB()
    .collection('authors')
    .findOne({ name: authorName });

  if (!author) {
    console.log('empty, creating author');
    author = {
      name: authorName,
    };
    const authorResult = await db
      .getDB()
      .collection('authors')
      .insertOne(author);
  }

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: author._id,
      name: authorName,
    },
  };
  // get the database, create collection and insert
  const result = await db.getDB().collection('posts').insertOne(newPost);
  res.redirect('/posts');
});
router.get('/post/:id', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDB()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) });

  if (!post) {
    res.status(404).render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  post.date = post.date.toISOString();
  res.render('post-detail', { post: post });
});
router.get('/post/:id/edit', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDB()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) });
  res.render('update-post', { post: post });
});
router.post('/post/:id/edit', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDB()
    .collection('posts')
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
        },
      }
    );
  res.redirect('/posts');
});
router.post('/post/:id/delete', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDB()
    .collection('posts')
    .deleteOne({ _id: postId });

  res.redirect('/posts');
});
router.get('/post/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const comments = await db
    .getDB()
    .collection('comments')
    .find({ postId: postId })
    .toArray();
  // express library has its own function that encodes data to json
  return res.json(comments);
});
router.post('/post/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  console.log(req.body);
  const commentPost = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  await db.getDB().collection('comments').insertOne(commentPost);
  res.json({ message: 'Comment Added' });
});
module.exports = router;
