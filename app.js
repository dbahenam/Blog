const path = require("path");
const express = require("express");
const db = require("./data/database");
const blogRoutes = require("./routes/blog");

const app = express();

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.json()); // parse incoming json (FOR Ajax Posts)
app.use(express.static("public")); // Serve static files (e.g. CSS files)

// Activate EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(blogRoutes);

db.connectToDB().then(function () {
  app.listen(3000);
});
