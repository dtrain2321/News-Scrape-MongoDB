//Scrape
$(document).on("click", ".scrape", function(){
    $(".load").html("<h3>Loading new articles...</h3>");
    $.get( "/scrape", function (req, res) {
        console.log(res);
    }).then(function(data) {
        window.location.href = "/";
    });
  });
  
  $(document).on("click", ".home", function(){
    $.get( "/", function (req, res) {
        console.log(res);
    }).then(function(data) {
        window.location.href = "/";
    });
  });
  
  //Save article
  $(document).on("click", ".save", function(e){
    $(this).parent().remove();
    var articleId = $(this).attr("data-id");
    $.ajax({
        url: '/save/' + articleId,
        type: "POST"
    }).done(function(data) {
        $(".article").filter("[data-id='" + articleId + "']").remove();
    });
  });
  
  //View saved article
  $(document).on("click", ".saved", function() {
    $.get( "/saved", function (req, res) {
        console.log(res);
    }).then(function(data) {
        window.location.href = "/saved";
    });
  });
  
  //Delete article after being saved
  $(document).on("click", ".unsave", function(){
    $(this).parent().remove();
    var articleId = $(this).attr("data-id");
  
    $.ajax({
        url: '/unsave/' + articleId,
        type: "POST"
    }).done(function(data) {
        $(".article").filter("[data-id='" + articleId + "']").remove();
    });
  })
  
  //Open note modal
  $(document).on("click", ".addNote", function (e){
    $("#notes").empty();
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "GET",
      url: "/getNotes/" + thisId
    }).then(function(data){
        console.log(data);
          $("#notes").append("<h3>" + data.title + "</h3>");
          $("#notes").append("<hr />");
          $("#notes").append("<h5>Previous Note:</h5>")
          $("#notes").append("<strong id='notestitle'></strong>");
          $("#notes").append("<p id='notesbody'></p>");
          $("#notes").append("<div class='form-group'><label for='title'>Title: </label><input id='titleinput' class='form-control' name='title'></div>");
          $("#notes").append("<div class='form-group'><label for='body'>Note: </label><input id='bodyinput' class='form-control' name='body'></div>");
          $("#notes").append("<hr />");
          $("#notes").append("<button class='btn btn-default' data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
          if (data.note) {
            $("#notestitle").text(data.note.title);
            $("#notesbody").text(data.note.body);
          }
      });
      $("#noteModal").modal();
  });
  
  //Create a note
  $(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/createNote/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    }).then(function(data) {
        console.log(data);
        $("#notes").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
    $("#noteModal").modal("hide");
  });