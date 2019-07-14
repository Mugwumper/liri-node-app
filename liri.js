require("dotenv").config();

var inquirer    = require("inquirer");
var keys        = require("./keys.js");
var Spotify     = require("node-spotify-api");

var log         = console.log;
//console.log(keys);



processCmd();

function processCmd() {
    // Grab command line argv's
    var cmd = process.argv[2];
    var searchStr = process.argv[3];
    for (var i = 4; i < process.argv.length; i++) {
        searchStr += (" " + process.argv[i]);
    };
    APIchoice = cleanCmd(cmd);

    console.log(APIchoice);
    // Switch to determine what to do
    switch (APIchoice) {
        case "test":
            doInquirer();
            break;
        case "spotify-this":
            searchSpotify(searchStr);
            break;

        default:
            log("unrecognized command - value: '" + APIchoice + "'");
            break;
    };
}

function cleanCmd(cmd) {// This attempts to take a string of almost anything and turn it into an ordinal item.
    var isSpot = checkforSpot();
    //console.log(cmd);  

    function checkforSpot() {
        var foundSpot = false;
        var list_spots = ['spot', 'song', 'tune'];
        list_spots.forEach(isInCommand);
        function isInCommand(item) {
            //console.log("checking if " + item + " is in the string '" + cmd + "'");
            if (cmd.includes(item)) { // will not work in IE (should I care?)
                //console.log(" - it IS in the string!");
                foundSpot  = true; 
            }
        }
        return foundSpot;
    }

    if (isSpot) { 
        log("value found to be in the list for Spotify");
        return "spotify-this";
    } 
    console.log("value NOT found to be in the list for Spotify");
        
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

function doInquirer() {// currently only used for
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
        // id: "664f2184d3864e18bdf11fd4b8c5882b",
        // secret: "7d1e4a51eb594e9981b344e16222c7c7",
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