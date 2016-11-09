"use strict";
//Set browersify requires
let searchMovie = require("./searchMovie");
let credentials = require("./credentials");

let firebaseMethods = require("./firebaseMethods");
let firebaseAuth = require("./firebaseAuth");
let firebaseUser = require("./firebaseUser");
//Set variables

let apiKeys = {};
let uid = "";


function createLogoutButton(){
	firebaseUser.getUser(apiKeys, uid).then(function(userResponse){
		$("#logout-container").html("");
		let currentUsername = userResponse.username;
		let logoutButton = `<button class="btn btn-danger" id="logoutButton">LOGOUT ${currentUsername}</button>`;
		$("#logout-container").append(logoutButton);
	});
}

//Load functions
function displaySearchMovie(movieSearched){
	//clear out DOM
	searchMovie(movieSearched).then((returnedMovie)=>{
		$("#movieSearchArea").html("");
		console.log("returned Movie: ", returnedMovie);
		let searchedMovieCard =
			`<div class="row">
				<div class="col s6">
			    <h4 class="header">${returnedMovie.Title} (${returnedMovie.Year})</h2>
			    <div class="card horizontal">
			      <div class="card-image">
			        <img src="${returnedMovie.Poster}" width="75%" height="75%">
			      </div>
			      <div class="card-stacked">
			        <div class="card-content">
							<p>Starring ${returnedMovie.Actors}</p><br />
							<p>${returnedMovie.Plot}</p>
			        </div>
			        <div class="card-action">
								<p>Rating</p>
								<p>
						      <input name="movieRating" type="radio" id="rating_1" />
									<label for="rating_1">1</label>

						      <input name="movieRating" type="radio" id="rating_2" />
									<label for="rating_2">2</label>

						      <input name="movieRating" type="radio" id="rating_3" />
									<label for="rating_3">3</label>

						      <input name="movieRating" type="radio" id="rating_4" />
									<label for="rating_4">4</label>

						      <input name="movieRating" type="radio" id="rating_5" />
									<label for="rating_5">5</label>
						    </p>

								<p>
									<input type="checkbox" id="test5" />
									<label for="test5">I've seen it</label>
								</p>
			          <button class="btn btn-primary save-btn">Save to My Collection</button>
			        </div>
			      </div>
			    </div>
			  </div>`;
		//get elements from data and append to DOM
		$("#movieSearchArea").html(searchedMovieCard);
		//add save button & rate button & seen/unseen checkbox? radio?
	});
}
function getSavedMovies(){
	//getUser and use uid
	firebaseUser.getUser(apiKeys, uid).then((userResponse)=>{
		console.log("userResponse", userResponse);
	}).catch( (error)=>{
		console.log("error", error);
	});
	//getMovieSearches
	firebaseMethods.getMovies(apiKeys, uid).then((savedMovies)=>{
		console.log("savedMovies", savedMovies);

		$.each(savedMovies, (index, movie)=>{
			if (movie.watched){
				displaySeenMovies(movie);
			} else if (!movie.watched) {
				displayUnseenMovies(movie);
			} else {
				console.log("no movies");
			}

		});
	}).catch( (error)=>{
		console.log("error", error);
	});
	//check if search is seen or unseen with true or false
	//displaySeenMovies
	//displayUnseenMovies

}
function displaySeenMovies(savedMovie){
//append seen movies to $("#seenMovies")
	console.log("seen Movie", savedMovie);
}
function displayUnseenMovies(savedMovie){
//append unseen movies to $("#unseenMovies")
	console.log("unseenseen MOvie", savedMovie);
}
//Load page
$(document).ready(function() {
	credentials().then( (keys)=>{
		apiKeys = keys;
		console.log("keys", keys);
		firebase.initializeApp(keys);
	});

	//get Movie search title on enter key
	$('#movie-input').keypress( (event)=>{
		if (event.which == 13){
			let movieTitle = $("#movie-input").val();
			displaySearchMovie(movieTitle);
			$("#movie-input").val("");
		}
	});
	//get Movie search title on button click
	$('#search-button').on("click", (event)=>{
		let movieTitle = $("#movie-input").val();
		displaySearchMovie(movieTitle);
		$("#movie-input").val("");
	});

	$("#registerButton").on("click", function(){
		let email = $("#inputEmail").val();
		let password = $("#inputPassword").val();
		let username = $("#inputUsername").val();

		let user = {
			"email": email,
			"password": password
		};

		firebaseAuth.registerUser(user).then(function(registerResponse){
			console.log("register response", registerResponse);
			let newUser = {
				"username": username,
				"uid": registerResponse.uid
			};

			return firebaseUser.addUser(apiKeys, newUser);
			//return FbAPI.loginUser(user);

		}).then(function(addUserResponse){
			return firebaseAuth.loginUser(user);
		}).then(function(loginResponse){
			console.log("login response", loginResponse);
			uid = loginResponse.uid;
			createLogoutButton();
			$("#login-container").addClass("hide");
			$("#movie-container").removeClass("hide");
			getSavedMovies();
		});
	});

	$("#loginButton").on("click", function(){
		let email = $("#inputEmail").val();
		let password = $("#inputPassword").val();

		let user = {
			"email": email,
			"password": password
		};

		firebaseAuth.loginUser(user).then(function(loginResponse){
			uid = loginResponse.uid;
			createLogoutButton();
			$("#login-container").addClass("hide");
			$("#movie-container").removeClass("hide");
			getSavedMovies();

		});
	});

	$("#logout-container").on("click", "#logoutButton", function(){
		firebaseAuth.logoutUser();
		uid="";

		$("#inputEmail").val("");
		$("#inputPassword").val("");
		$("#inputUsername").val("");
		$("#login-container").removeClass("hide");
		$("#movie-container").addClass("hide");
	});

});
