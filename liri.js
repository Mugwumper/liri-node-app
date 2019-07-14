require("dotenv").config();

var inquirer = require("inquirer");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");

var log = console.log;

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
        //log(APIchoice.cmd);
        switch (APIchoice.cmd) {
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
            default:
                log("unrecognized command - value: '" + APIchoice + "'");
                break;
        };
    }
}

function cleanCmd(APIchoice) {// This attempts to take a string of almost anything and turn it into an ordinal item.
    var cmd = APIchoice.cmd.toLowerCase();

    var foundCount = 0;
    var isSpot = checkforSpot();
    var isBIT = checkforBIT();
    var isMovie = checkforMovie();
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
    function checkforItemInList(list) {
        var found = false;
        list.forEach(isInCommand);
        function isInCommand(item) {
            //console.log("checking if " + item + " is in the string '" + cmd + "'");
            if (cmd.includes(item)) { // will not work in IE (should I care?)
                //console.log(" - it IS in the string!");
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
                log("value found to be in the list for Spotify");
                APIchoice.cmd = "spot";
            }
            if (isBIT) {
                log("value found to be in the list for Bands In Town");
                APIchoice.cmd = "BIT";
            }
            if (isMovie) {
                log("value found to be in the list for OMDB");
                APIchoice.cmd = "OMDB";
            }
            return true;
        default:
            log("unexpected condition - command resolved for more than one API.");
            return false;
    }

    //console.log("value NOT found to be in the list for Spotify");

    // var isMovies = false;
    // var isBand = false;
    // var list_movies = ['movie', 'film'];
    // var list_band = ['concert', 'bands', 'venue'];

    // if (cmd.includes("spot")) { // will not work in IE (should I care?)
    //     return "spotify-this";
    // }
    // console.log("processing command:" + cmd);
    // return cmd;
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
    log("searching Bands In Town using search term: '" + searchStr + "'");
    // Run the axios.get function...
    // The axios.get function takes in a URL and returns a promise (just like $.ajax)
    axios
        //.get("https://en.wikipedia.org/wiki/Kudos_(granola_bar)")
        .get("https://rest.bandsintown.com/artists/" + searchStr.replace(/ /g, "+") + "/events?app_id=" + keys.bandsintown)

        .then(function (response) {
            // If the axios was successful...
            // Then log the body from the site!
                log(response.data);
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
    log("searching OMDB using search term: '" + searchStr + "'");
    // Run the axios.get function...
    // The axios.get function takes in a URL and returns a promise (just like $.ajax)
    axios
        .get("http://www.omdbapi.com/?t=" + searchStr + "&y=&plot=short&apikey=" + keys.omdb)
        .then(function (response) {
            // If the axios was successful...
            // Then log the body from the site!
                log(response.data);
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

///http://www.omdbapi.com/?i=tt3896198&apikey=ab4826cd





function concertThis() {
    if (!input) {
        log("\n" + chalk.red.underline("ERROR: You did not provide an artist!\n"));
        log("Usage: node liri.js concert-this <artist-name>\n");
        return;
    } else {
        var artist = input.trim();
    };

    var queryUrl = "https://rest.bandsintown.com/artists/" + artist.replace(/ /g, "+") + "/events?app_id=" + keys.bandsintown;
    request(queryUrl, function (error, response, body) {
        if (error) return console.log(error);
        if (!error && response.statusCode === 200) {
            if (body.length < 20) {
                return log(chalk.red.underline("\nNo results found...\n"));
            };
            var data = JSON.parse(body);
            for (var i = 0; i < 3; i++) {
                log(chalk.red.bold("#" + (i + 1)));
                log(chalk.green.bold("Venue:     ") + data[i].venue.name);
                log(chalk.green.bold("Location:  ") + data[i].venue.city + ", " + data[i].venue.country);
                log(chalk.green.bold("Date:      ") + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n");
                var logData =
                    `Artist: ${artist}\n` +
                    `Venue: ${data[i].venue.name}\n` +
                    `Location: ${data[i].venue.city}, ${data[i].venue.country}\n` +
                    "Date: " + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n";
                logFile(logData);
                logFile("---------------\n");
            };
        };
    });
};

function movieThis() {
    if (!input) {
        log(chalk.red.underline("\nNo movie specified. Defaulting to 'Mr. Nobody'"))
        var movie = "mr+nobody";
    } else {
        var movie = input.trim().replace(/ /g, "+");
    };

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + keys.omdb;
    request(queryUrl, function (error, response, body) {
        if (error) return console.log(error);
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            if (data.Response == "False") return log(chalk.red.underline("\nMovie not found...\n"));
            var actors = data.Actors;
            var actorsArr = actors.split(',');
            if (data.Ratings == []) {
                var rottenTomatoes = "N/A"
            } else {
                if (data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")) {
                    var rottenTomatoes = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes").Value;
                } else {
                    var rottenTomatoes = "N/A";
                }
            };
            log('');
            log(chalk.blue.bold("Title:                  ") + data.Title);
            log(chalk.blue.bold("Year:                   ") + data.Year);
            log(chalk.blue.bold("IMDB rating:            ") + data.imdbRating);
            log(chalk.blue.bold("Rotten Tomatoes rating: ") + rottenTomatoes);
            log(chalk.blue.bold("Produced in:            ") + data.Country);
            log(chalk.blue.bold("Language:               ") + data.Language);
            log(chalk.blue.bold("Plot: \n") + data.Plot);
            log(chalk.blue.bold("Actors:"));
            for (var j = 0; j < actorsArr.length; j++) {
                log('- ' + actorsArr[j].trim());
            };
            log('');

            var logData =
                `Title: ${data.Title}\n` +
                `Year: ${data.Year}\n` +
                `IMDB rating: ${data.imdbRating}\n` +
                `Rotten Tomatoes rating: ${rottenTomatoes}\n` +
                `Produced in: ${data.Country}\n` +
                `Language: ${data.Language}\n` +
                `Plot: ${data.Plot}\n` +
                `Actors: ${actors}\n`;
            logFile(logData);
            logFile("---------------\n");
        };
    });
};

