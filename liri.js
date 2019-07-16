require("dotenv").config();

const LOG_DEBUG = 1;
const LOG_WRITE = 2;

var inquirer = require("inquirer");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require('moment');

var gDebug = true; // this serves as a master switch, try it out
var logOut = [];  

function log(msg, dest) { // handles logging to screen and file. 
    if ((dest & LOG_WRITE) === LOG_WRITE) {
        logOut.push(msg);  // store the message in a list to write to file later
    }

    if ((dest & LOG_DEBUG) === LOG_DEBUG) {
        if (!gDebug) {
            return false;// stop now, this is a debug message and we are not debugging.
        }
    }
    // init();
    // async function init(){
    //     console.log(msg);
    //     await sleep(1000)
    //  }
    //  function sleep(ms){
    //      return new Promise(resolve=>{
    //          setTimeout(resolve,ms)
    //      })
    //  }
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

function cleanCmd(APIchoice) {// This attempts to take a string of almost anything and turn it into an 'ordinal'.
    log("cleanCmd called with parameter: '" + APIchoice.cmd + "'", LOG_DEBUG);
    var cmd = APIchoice.cmd.toLowerCase();
    var foundCount = 0;
    var isSpot = checkforSpot();
    var isBIT = checkforBIT();
    var isMovie = checkforMovie();
    var isSpecial = checkforSpecial();
    function checkforSpot() {  // make sure all lists use lowercase chars only
        var list = ['spot', 'song', 'tune'];
        return checkforItemInList(list);
    }
    function checkforBIT() {
        var list = ['band', 'concert', 'venue'];
        return checkforItemInList(list);
    }
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
            //log("\tchecking if " + item + " is in the string '" + cmd + "'", LOG_DEBUG);
            if (cmd.includes(item)) { // will not work in IE (should I care?)
                //log("\t\t - it IS in the string!", LOG_DEBUG);
                found = true;
            }
        }
        if (found) foundCount++;
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
    //     * If no song is provided then your program will default to "The Sign" by Ace of Base.
    if (searchStr === "") {
        log("\nSearch empty, defaulting to 'The Sign'",LOG_WRITE);
        searchStr = 'The Sign';
    }
    log("\r\n\r\nsearching Spotify using search term: '" + searchStr + "' showing first 5 results\r\n", LOG_WRITE);
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret,
    });
    spotify
        .search({ type: 'track', query: searchStr })
        .then(function(response) {
            for (var i = 0; i < 5; i++) {
                log("item " + (i+1) + ":", LOG_WRITE);
                log("\tArtist(s):\t" + response.tracks.items[i].artists[0].name, LOG_WRITE);
                log("\tSong Name:\t" + response.tracks.items[i].name, LOG_WRITE);
                log("\tAlbum Name:\t" + response.tracks.items[i].album.name, LOG_WRITE);
                log("\tPreview Link:\t" + response.tracks.items[i].preview_url, LOG_WRITE);
            }
            saveLog();
        })
        .catch(function(err) {
            log(err, LOG_WRITE);
        });
}

// cd C:/Data/Dropbox/Work/bootcamp/homework/liri-node-app
//C:/data/Dropbox/Work/bootcamp/code/01-Class-Content/01-html-git-css/01-Activities/UNCRAL201904FSF5
//  https://stackoverflow.com/questions/26973484/node-dotenv-is-not-working

// 
//npm i -g inspect-process

function searchBIT(searchStr) {


        var queryUrl = "https://rest.bandsintown.com/artists/" + searchStr + "/events?app_id=codingbootcamp";
        axios.get(queryUrl).then(
            function(response) {
                if(response.data[0].venue !=  undefined) {
                    console.log("Event Veunue: " + response.data[0].venue.name);
                    console.log("Event Location: " + response.data[0].venue.city);
                    var eventDateTime = moment(response.data[0].datetime);
                    console.log("Event Date & Time: " + eventDateTime.format("dddd, MMMM Do YYYY"));
                }
                else {
                    console.log("No results found.");
                }
            }
        ).catch(function (error) {
            console.log (error);
      });






    // * Name of the venue
    // * Venue location
    // * Date of the Event (use moment to format this as "MM/DD/YYYY")
    log("\r\n\r\nSearching Bands In Town using search term: '" + searchStr + "' showing first 3 results\r\n", LOG_WRITE);
    searchStr = searchStr.replace(/ /g, "+");
    var queryUrl = "https://rest.bandsintown.com/artists/" + searchStr + "/events?app_id=" +  + keys.bandsintown;
    axios
        .get(queryUrl).then(
            function (response) {
                log("axios get was successful...", LOG_DEBUG);

                console.log("response" + response);

                // if(response.data[0].venue !=  undefined) {
                //     console.log("Event Veunue: " + response.data[0].venue.name);
                //     console.log("Event Location: " + response.data[0].venue.city);
                //     var eventDateTime = moment(response.data[0].datetime);
                //     console.log("Event Date & Time: " + eventDateTime.format("dddd, MMMM Do YYYY"));
                // }
                // else {
                //     console.log("No results found.");
                // }

                // // Then log the body from the site!
                // for (var i = 0; i < 3; i++) {
                //     log("item " + (i+1) + ":", LOG_WRITE);
                //     var data = response.data[i];
                //     console.log(JSON.stringify(response));
                //     log("\tVenue:\t" + data.venue.name, LOG_WRITE);
                //     log("\tLocation:\t" + data.venue.city + ", " + data.venue.country, LOG_WRITE);
                //     var offer = data.offers[0];
                //     log("\tDate:\t" + moment(data.datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + " (" + offer.type + " " + offer.status + ")", LOG_WRITE);
                //     saveLog();
                // };
            })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                log(error.response.data, LOG_WRITE);
                log(error.response.status, LOG_WRITE);
                log(error.response.headers, LOG_WRITE);
                saveLog();
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                log(error.request, LOG_WRITE);
            } else {
                // Something happened in setting up the request that triggered an Error
                log("Error", error.message, LOG_WRITE);
            }
            log(error.config, LOG_WRITE);
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
    if (searchStr === '') searchStr = 'Mr. Nobody';
    searchStr = searchStr.replace(/ /g, "+");
    log("searching OMDB using search term: '" + searchStr + "'");
    axios
        .get("http://www.omdbapi.com/?t=" + searchStr + "&y=&plot=short&apikey=" + keys.omdb)
        .then(function (response) {
            //log(response);
            log("", LOG_WRITE);
            log("Movie Title: \t\t" + response.data.Title, LOG_WRITE);
            log("Year of Release: \t" + response.data.Year, LOG_WRITE);
            log("IMDB Rating: \t\t" + response.data.imdbRating, LOG_WRITE);
            log("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value, LOG_WRITE);
            log("Country Produced: \t" + response.data.Country, LOG_WRITE);
            log("Language: \t\t" + response.data.Language, LOG_WRITE);
            log("Plot: \t\t\t" + response.data.Plot, LOG_WRITE);
            log("Actors: \t\t" + response.data.Actors, LOG_WRITE);
            saveLog();
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                log(error.response.data, LOG_WRITE);
                log(error.response.status, LOG_WRITE);
                log(error.response.headers, LOG_WRITE);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an object that comes back with details pertaining to the error that occurred.
                log(error.request, LOG_WRITE);
            } else {
                // Something happened in setting up the request that triggered an Error
                log("Error", error.message, LOG_WRITE);
            }
            log(error.config, LOG_WRITE);
        });
}

function searchUsingRandomTxt() {
    // * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
    // * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
    // * Edit the text in random.txt to test out the feature for movie-this and concert-this.
    log("searchUsingRandomTxt called", LOG_DEBUG);
    var fs = require('fs');
    var readline = require('readline');
    var filename = 'random.txt';
    readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
    }).on('line', function (line) {
        var arr = line.split(',');
        var APIchoice = { cmd: arr[0] };
        var searchStr = arr[1];
        log("reading 'random.txt' file, cmd: " + APIchoice.cmd + " search string: " + searchStr, LOG_DEBUG, LOG_WRITE);
        if (cleanCmd(APIchoice)) {
            processBoth(APIchoice.cmd, searchStr);
        }
    });
}

function saveLog() {
    if (logOut.length > 0) {
        log("saveLog - number of lines to add to the log file: " + logOut.length, LOG_DEBUG);
        var fileContent = "";
        logOut.forEach(function(element) {
            fileContent += element + "\r\n";
        });          
        var fs = require('fs');
        fs.appendFile('log.txt', fileContent, function (err) {
            if (err) throw err;
            log('\tlog.txt updated!', LOG_DEBUG);
        });
        logOut = []; // clear the logOut array
    } else {
        log("saveLog - nothing to save to log.txt", LOG_DEBUG);
    }
}
