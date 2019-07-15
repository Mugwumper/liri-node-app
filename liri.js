require("dotenv").config();

const LOG_DEBUG = 1;
const LOG_WRITE = 2;

var inquirer = require("inquirer");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require('moment');

var gDebug = true; // this serves as a master switch, try it out
var LogOut = [];

function log(msg, dest) { // handles logging to screen and file. 
    if ((dest & LOG_WRITE) === LOG_WRITE) {
        LogOut.push(msg);
        // store the message in a list to write to file later
    }

    if ((dest & LOG_DEBUG) === LOG_DEBUG) {
        if (!gDebug) {
            return false;// stop now, this is a debug message and we are not debugging.
        }
    }
    console.log(msg);
}

processCmd(); // entry point

function processCmd() {
    // Grab command line argv's
    // make an object for the command so it can be passed into functions by reference.
    var APIchoice = { cmd: process.argv[2] };
    var searchStr = process.argv[3];
    for (var i = 4; i < process.argv.length; i++) {
        searchStr += (" " + process.argv[i]);
    };
    if (cleanCmd(APIchoice)) {
        processBoth(APIchoice.cmd, searchStr);
    }
}

function processBoth(cmd, searchStr) {
    //log(APIchoice.cmd);
    switch (cmd) {
        case "test":
            doInquirer();
            break;
        case "spot":
            searchSpotify(searchStr);
            break;
        case "BIT":
            searchBIT(searchStr);
            break;
        case "OMDB":
            searchOMDB(searchStr);
            break;
        case "special":
            searchUsingRandomTxt();
            break;
        default:
            log("unrecognized command - value: '" + cmd + "'");
            break;
    };
}

function cleanCmd(APIchoice) {// This attempts to take a string of almost anything and turn it into an ordinal item.
    var cmd = APIchoice.cmd.toLowerCase();

    var foundCount = 0;
    var isSpot = checkforSpot();
    var isBIT = checkforBIT();
    var isMovie = checkforMovie();
    var isSpecial = checkforSpecial();
    //console.log(cmd);  

    // function checkforSpot() {
    //     var found = false;
    //     var list = ['spot', 'song', 'tune'];
    //     list.forEach(isInCommand);
    //     function isInCommand(item) {
    //         //console.log("checking if " + item + " is in the string '" + cmd + "'");
    //         if (cmd.includes(item)) { // will not work in IE (should I care?)
    //             //console.log(" - it IS in the string!");
    //             found  = true; 
    //         }
    //     }
    //     return found;
    // }
    function checkforSpot() {  // make sure all lists use lowercase chars only
        var list = ['spot', 'song', 'tune'];
        return checkforItemInList(list);
    }
    function checkforBIT() {
        var list = ['band', 'concert', 'venue'];
        return checkforItemInList(list);
    }
    // function checkforMovie() {
    //     var list = ['movie', 'OMDB', 'film'];
    //     list.forEach(isInCommand);
    //     function isInCommand(item) {
    //         //console.log("checking if " + item + " is in the string '" + cmd + "'");
    //         if (cmd.includes(item)) { // will not work in IE (should I care?)
    //             //console.log(" - it IS in the string!");
    //             found  = true; 
    //         }
    //     }
    //     return found;
    // }

    function checkforMovie() {
        var list = ['movie', 'omdb', 'film'];
        return checkforItemInList(list);
    }

    function checkforSpecial() {
        var list = ['do-what-it-says'];
        return checkforItemInList(list);
    }
    function checkforItemInList(list) {
        var found = false;
        list.forEach(isInCommand);
        function isInCommand(item) {
            //log("checking if " + item + " is in the string '" + cmd + "'", LOG_DEBUG);
            if (cmd.includes(item)) { // will not work in IE (should I care?)
                //log(" - it IS in the string!", LOG_DEBUG);
                foundCount++;
                found = true;
            }
        }
        return found;
    }

    switch (foundCount) {
        case 0:
            log("Unable to search. Command can not be resolved to any of the APIs.");
            return false;
        case 1:
            if (isSpot) {
                log(APIchoice.cmd + " determined to be used for Spotify", LOG_DEBUG);
                APIchoice.cmd = "spot";
            }
            if (isBIT) {
                log(APIchoice.cmd + " determined to be used for Bands In Town", LOG_DEBUG);
                APIchoice.cmd = "BIT";
            }
            if (isMovie) {
                log(APIchoice.cmd + " determined to be used for OMDB", LOG_DEBUG);
                APIchoice.cmd = "OMDB";
            }
            if (isSpecial) {
                log("will process random.txt file", LOG_DEBUG);
                APIchoice.cmd = 'special';
            }
            return true;
        default:
            log("unexpected condition - command resolved for more than one API.");
            return false;
    }
}

function doInquirer() {// currently only used for testing
    inquirer
        .prompt([{
            type: "input",
            message: "state what you are looking for",
            name: "searchstr"
        }])
        .then(function (inquirerResponse) {
            stuff(inquirerResponse);
        })
}

function stuff(inquirerResponse) { // temp
    searchStr = inquirerResponse.searchstr;
    console.log("/nthis is your search:  " + searchStr);
    searchSpotify(searchStr);
}

function searchSpotify(searchStr) {

    //     * This will show the following information about the song in your terminal/bash window

    //     * Artist(s)

    //     * The song's name

    //     * A preview link of the song from Spotify

    //     * The album that the song is from

    //   * If no song is provided then your program will default to "The Sign" by Ace of Base.

    log("searching Spotify using search term: '" + searchStr + "'");
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret,
    });
    spotify.search({
        type: "track",
        query: searchStr
    }, function (err, data) {
        if (err) {
            return log("Error occurred: '" + err + "' - song not found.");
        }
        var name = data.tracks.items[0].name;
        var artist = data.tracks.items[0].artists[0].name;
        var album = data.tracks.items[0].album.name;
        log('');
        log("Title:\t\t") + name;
        log("Artist:\t\t") + artist;
        log("Album:\t\t") + album;

        log(JSON.stringify(data.tracks.items[0]));
    });
}

// cd C:/Data/Dropbox/Work/bootcamp/homework/liri-node-app
//C:/data/Dropbox/Work/bootcamp/code/01-Class-Content/01-html-git-css/01-Activities/UNCRAL201904FSF5
//  https://stackoverflow.com/questions/26973484/node-dotenv-is-not-working

// 
//npm i -g inspect-process

function searchBIT(searchStr) {
    log("searching Bands In Town using search term: '" + searchStr + "'", (LOG_DEBUG | LOG_WRITE));
    // Run the axios.get function...
    // The axios.get function takes in a URL and returns a promise (just like $.ajax)
    axios
        //.get("https://en.wikipedia.org/wiki/Kudos_(granola_bar)")
        .get("https://rest.bandsintown.com/artists/" + searchStr.replace(/ /g, "+") + "/events?app_id=" + keys.bandsintown)
        .then(function (response) {
            // If the axios was successful...
            // Then log the body from the site!
            for (var i = 0; i < 3; i++) {
                var data = response.data[i];
                log("#" + (i + 1));
                log("Venue:     " + data.venue.name);
                log("Location:  " + data.venue.city + ", " + data.venue.country);
                var offer = data.offers[0];
                log("Date:      " + moment(data.datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + " (" + offer.type + " " + offer.status + ")");
            };
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                log(error.response.data);
                log(error.response.status);
                log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                log("Error", error.message);
            }
            log(error.config);
        });
}

function searchOMDB(searchStr) {

    //     * This will output the following information to your terminal/bash window:

    //     ```
    //       * Title of the movie.
    //       * Year the movie came out.
    //       * IMDB Rating of the movie.
    //       * Rotten Tomatoes Rating of the movie.
    //       * Country where the movie was produced.
    //       * Language of the movie.
    //       * Plot of the movie.
    //       * Actors in the movie.
    //     ```

    //   * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'


    searchStr = searchStr.replace(/ /g, "+");

    log("searching OMDB using search term: '" + searchStr + "'");
    // Run the axios.get function...
    // The axios.get function takes in a URL and returns a promise (just like $.ajax)
    axios
        .get("http://www.omdbapi.com/?t=" + searchStr + "&y=&plot=short&apikey=" + keys.omdb)
        .then(function (response) {
            // If the axios was successful...
            // Then log the body from the site!

            log("results from API: " + JSON.parse(response));
            log("response.title " + response.title);

            // for (var i = 0; i < 3; i++) {
            //     var data = response.data[i];
            //     log("#" + (i + 1));
            //     var actors = data.Actors;
            //     var actorsArr = actors.split(',');
            //     if (data.Ratings == []) {
            //       var rottenTomatoes = "N/A"
            //     } else {
            //       if (data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")) {
            //         var rottenTomatoes = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes").Value;
            //       } else {
            //         var rottenTomatoes = "N/A";
            //       }
            //     };
            //     log('');
            //     log("Title:                  " + data.Title)
            //     log("Year:                   " + data.Year);
            //     log("IMDB rating:            " + data.imdbRating);
            //     log("Rotten Tomatoes rating: " + rottenTomatoes);
            //     log("Produced in:            " + data.Country);
            //     log("Language:               " + data.Language);
            //     log("Plot: \n" + data.Plot);
            //     log("Actors:");
            //     for (var j = 0; j < actorsArr.length; j++) {
            //       log('- ' + actorsArr[j].trim());
            //     };
            //     log('');
            //           };
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                log(error.response.data);
                log(error.response.status);
                log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                log("Error", error.message);
            }
            log(error.config);
        });
}

function searchSpecial() {
    // * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
    // * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
    // * Edit the text in random.txt to test out the feature for movie-this and concert-this.
    fs.readFile('random.txt', 'utf8', function (err, data) {
        if (err) return log(err);
        var arr = data.split(',');
        var cmd = arr[0];
        var searchStr = arr[1];
        log("reading 'random.txt' file, cmd: " + cmd + " search string: " + searchStr, LOG_DEBUG, LOG_WRITE);
        processBoth(cmd, searchStr);
    }
}