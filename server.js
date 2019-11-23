// Server vars
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var hbs = require("handlebars");

// Sraper vars
var axios = require("axios");
//var request = require("request");
var cheerio = require("cheerio");

//Use DB models
var db = require("./models");

// Web port and DB connection setup
var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
var app = express();

//logging and handlebars
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(process.cwd() + "/public"));
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//limit results to handlebars
hbs.registerHelper("each_upto", function(array, max, options) {
  if(!array || array.length == 0)
      return options.inverse(this);

  var result = [];
  for(var i = 0; i < max && i < array.length; ++i)
      result.push(options.fn(array[i]));
  return result.join("");
});

//Promise function
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);




//////////////
//ROUTES


app.get("/", function(req, res) {
  db.Article
    .find({saved: false})
    .then(function(dbArticle) {
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

/////////////
//SCRAPING
app.get("/scrape", function(req, res){
 
 
 
 axios.get("https://9to5mac.com/").then(function(response){

 //use cheerio to parse results, call $
    var $ = cheerio.load(response.data);
    $(".post-content").each(function(i, element){

      //result object
      var result ={};
     // result.title = $(this).find('a').find('href').attr('text');

     result.title = $(this)
        .find('h1')
        .text();

     // console.log(result.title);

      result.link = $(this)
        .find('a')
        .attr("href");

     // console.log(result.link);

      result.image = $(this)
        .find('img')
        .attr('src');

    //  console.log(result.image);
      

      result.saved = false;
      db.Article.create(result).then(function(dbArticle){
        console.log(dbArticle);
      })
      .catch(function(err){
        return res.json(err);
      });
    });
    res.send("Scrape is Complete");
  });
});

// Route for specific Article by id, update status to "saved"
app.post("/save/:id", function(req, res) {
  db.Article
    .update({ _id: req.params.id }, { $set: {saved: true}})
    .then(function(dbArticle) {
      res.json("dbArticle");
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for specific Article by id, update status to "unsaved"
app.post("/unsave/:id", function(req, res) {
  db.Article
    .update({ _id: req.params.id }, { $set: {saved: false}})
    .then(function(dbArticle) {
      res.json("dbArticle");
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Route to render Articles with saved articles
app.get("/saved", function(req, res) {
  db.Article
  .find({ saved: true })
  .then(function(dbArticles) {
    var hbsObject = {
      articles: dbArticles
    };
    res.render("saved", hbsObject);
  })
  .catch(function(err){
    res.json(err);
  });
});


//get route to retrieve note for an article
app.get('/getNotes/:id', function (req,res){
  db.Article
    .findOne({ _id: req.params.id })
    .populate('note')
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

//post route to create a new note in the database
app.post('/createNote/:id', function (req,res){
  db.Note
    .create(req.body)
    .then(function(dbNote){
      return db.Article.findOneAndUpdate( {_id: req.params.id }, { note: dbNote._id }, { new:true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


/////////////////////
// Start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});