# liri-node-app
liri is like siri. Except that in this case it is a class assignment that uses Node JS. With it you can query one of three APIs that return information about songs, movies or upcoming concerts.

## Installation
To install and run the program do the following: 

1. Clone the repo " https://www.github.com/Mugwumper/liri-node-app.git"

2. navigate git-bash into the repo directory and type "npm install"

3. create .env file with your keys to the APIs

4. run the program by typing "node liri.js <command> <search>

## Usage

The command must be one continuous string, use dashes between words if you like. The actual wording is rather flexible. 

Any command having 'spot', 'song' or 'tune' will use the Spotify API. 

If you include 'band', 'concert' or 'venue' in your command Liri will search the Bands In Town API.

Likewise if you use 'movie', 'omdb' or 'film' the OMDb API will be used. 

Finally if your command contains 'do-what-it-says', 'special', 'read' or 'file' then the random.txt file will be used and this can itself contains a command and search parameter for any of the three APIs. 

### Logging

A history of commands, search parameters and the results are all stored in the file 'log.txt'.


