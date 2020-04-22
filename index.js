// html elements that need to be referenced
var $noteTitle = $(".note-title");   // title of note
var $noteText = $(".note-textarea");  // text of note
var $saveNoteBtn = $(".save-note");  // save note button
var $newNoteBtn = $(".new-note");  // start new note button
var $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
var activeNote = {};

// used to keep track of whether you are editting an existing note,
// or creating a new note.  
// true means an existing note is being editted; 
// false means a new note is being created
var editMode = false; 

// A function for getting all notes from the db file
var getNotes = function() {
  return $.ajax({
    url: "/api/notes",  // url and method must match path & function in notetaker.js
    method: "GET"
  });
};

// A function for saving a note to the db file
var saveNote = function(note) {

  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};

// A function for updating a note to the db file
var updateNote = function(note) {
  return deleteNote(note.id)
  .then(function() {
    saveNote(note);
  });
};

// A function for deleting a note from the db file
var deleteNote = function(id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
var renderActiveNote = function() {

  $saveNoteBtn.hide();  // only show save button when changes have been made to save

// display the note if it exists; 
// it can only be editted if editMode is true (meaning an existing note is being editted), 
// or if there is no active note
  if (activeNote.id) {
    if (editMode) {
      $noteTitle.attr("readonly", false);
      $noteText.attr("readonly", false);
    } else {
      $noteTitle.attr("readonly", true);
      $noteText.attr("readonly", true);
    };
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

// Random id generator based on code from
//    https://stackoverflow.com/questions/23327010/how-to-generate-unique-id-with-node-js
function generate() {
  // characters to choose from
  const _sym = "abcdefghijklmnopqrstuvwxyz1234567890";
  var str = "";
  const numChar = 10;
// concatenate one random character at a time to the string to be returned
  for (var i = 0; i < numChar; i++) {
    str += _sym[parseInt(Math.random() * _sym.length)];
  }

  return str;
}

// Get the note data from the inputs, save it to the db file and update the view
var handleNoteSave = function() {

  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
  };

  if (editMode) {
    newNote.id = activeNote.id;
    updateNote(newNote).then(function(data) {
      activeNote = {};  // reset - no active note
      editMode = false;  // not editting a current note
      getAndRenderNotes();
      renderActiveNote();
      handleRenderSaveBtn();
    });
  } else {
    newNote.id = generate();
    saveNote(newNote).then(function(data) {
      getAndRenderNotes();
      renderActiveNote();
      handleRenderSaveBtn();
    });
  };
  alert('"' + newNote.title + '" saved.');
};

// edit the clicked note
var handleNoteEdit = function(event) {
// prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  activeNote = $(this)
    .parent(".list-group-item")
    .data();

  editMode = true;  // since current note is being editted
  renderActiveNote();
  handleRenderSaveBtn();
};

// Delete the clicked note
var handleNoteDelete = function(event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  var note = $(this)
    .parent(".list-group-item")
    .data();

// de-activate the note if the active one is the one being deleted
  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(function() {
    getAndRenderNotes();
    renderActiveNote();
    handleRenderSaveBtn();
  });
    alert('"' + note.title + '" deleted.');
};

// Sets the activeNote and displays it
var handleNoteView = function() {
  editMode = false;
  activeNote = $(this)
    .parent(".list-group-item")
    .data();
  renderActiveNote();
  handleRenderSaveBtn();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function() {
  activeNote = {};
  renderActiveNote();
  handleRenderSaveBtn();
};

// The save button should be displayed ...
// Must be non-blanks in both title and text
// If editMode is on, (editting an existing note)
// or if editMode is off AND 
//    there is no active note  (this is a new note)
// Otherwise, the button is hidden
//    (either displaying an existing note that is not edittable
//    or creating a new note that doesn't have both a title and text yet)
var handleRenderSaveBtn = function() {
  // isActiveNoteEmpty is true if there is no active note
  var isActiveNoteEmpty = !Object.keys(activeNote).length; 

  if (
    ($noteTitle.val().trim() && $noteText.val().trim()) &&
    (
      (editMode) ||
      (isActiveNoteEmpty) 
    ))
  {
    $saveNoteBtn.show();
  } else {
    $saveNoteBtn.hide();
  }
};

// Render's the list of note titles
var renderNoteList = function(notes) {
  // clean out the note list
  $noteList.empty();
  var noteListItems = [];

// for each note, build the html li and append it.
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];

    var $li = $("<li class='list-group-item'>").data(note);
    // note title
    var $span = $(`<span class='display-note keyId' data-id='${note.id}'>`).text(note.title);
    // edit button
    var $editBtn = $(
      `<i class='fas fa-pen float-right edit-note keyId' data-id='${note.id}'>`
    );
    // delete button
    var $delBtn = $(
      `<i class='fas fa-trash-alt float-right text-danger delete-note keyId' data-id='${note.id}'>`
    );

    // put it all together
    $li.append($span, $delBtn, $editBtn);
    // and push it to the array of list items for each note
    noteListItems.push($li);
  }
// append the list of notes to the list in the html
  $noteList.append(noteListItems);
};

// Gets notes from the db file and renders them to the sidebar
var getAndRenderNotes = function() {
  return getNotes().then(function(data) {
    renderNoteList(data);
  });
};

// listen for any click event that needs to be handled.
$saveNoteBtn.on("click", handleNoteSave);   // Save a note
$noteList.on("click", ".display-note", handleNoteView);  // View a selected note
$newNoteBtn.on("click", handleNewNoteView);           // Start a new note
$noteList.on("click", ".delete-note", handleNoteDelete);  // delete a note
$noteList.on("click", ".edit-note", handleNoteEdit);  // edit a note
$noteTitle.on("keyup", handleRenderSaveBtn);   // display save button
$noteText.on("keyup", handleRenderSaveBtn);    // display save button

// Gets and renders the initial list of notes
getAndRenderNotes();
handleRenderSaveBtn();