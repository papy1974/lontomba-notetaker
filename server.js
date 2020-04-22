// need express to interact with the front end
const express = require("express");
// need path for filename paths
const path = require("path");
// need fs to read and write to files
const fs = require("fs");

// Tells node that we are creating an "express" server
var app = express();

// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

// Initialize notesData
let notesData = [];

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// sets up the default directory to use in the html files
app.use(express.static(path.join(__dirname, "Develop/public")));

// routes

// responding to the api call for all the notes, and sends results to the browser as an array of objects
app.get("/api/notes", function(err, res) {
  try {
    // reads the notes from the json file.
    notesData = fs.readFileSync("db.json", "utf8");
    // parses it so notesData is an array of objects
    notesData = JSON.parse(notesData);

    // error handling
  } catch (err) {
    console.log("\n error (in app.get.catch):");
    console.error(err);
  }
  // this has to be outside of the try/catch block.  Scoping??
  // send objects to browser
  // notesData is an array of objects
  res.json(notesData);
});

// writes the new note to the json file
app.post("/api/notes", function(req, res) {
  try {
    // reads the json file
    notesData = fs.readFileSync("db.json", "utf8");
    // parses the data to get an array of objects
    notesData = JSON.parse(notesData);
    // add the new note to the array of note objects
    notesData.push(req.body); // req.body - user input
    // make it a string (stringify) so you can write it to the file
    notesData = JSON.stringify(notesData);
    // write the new notes to the file
    fs.writeFile("db.json", notesData, "utf8", function(err) {
      // error handling
      if (err) throw err;
    });

    // change it back to an array of objects & send it back to the browser (client)
    res.json(JSON.parse(notesData)); // returning data to client (browser)

    // error handling
  } catch (err) {
    throw err;
    console.error(err);
  }
});

// Delete a note
app.delete("/api/notes/:id", function(req, res) {
  try {
    // reads the json file
    notesData = fs.readFileSync("db.json", "utf8");
    // parses the data to get an array of objects
    notesData = JSON.parse(notesData);
    // delete the old note from the array of note objects

    // based on code from...
    //   ... https://stackoverflow.com/questions/10024866/remove-object-from-array-using-javascript
    notesData = notesData.filter(function(note) {
      return note.id != req.params.id;
    });

    // make it a string (stringify) so you can write it to the file
    notesData = JSON.stringify(notesData);
    // write the new notes to the file
    fs.writeFile("db.json", notesData, "utf8", function(err) {
      // error handling
      if (err) throw err;
    });

    // change it back to an array of objects & send it back to the browser (client)
    res.json(JSON.parse(notesData)); // returning data to client (browser)

    // error handling
  } catch (err) {
    throw err;
    console.error(err);
  }
});

// HTML GET Requests

// Web page when the Get Started button is clicked.
app.get("/notes", function(req, res) {
  res.sendFile(path.join(__dirname, "notes.html"));
});

// If no matching route is found default to home
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});


// start the server
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
