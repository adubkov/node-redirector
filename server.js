/**
*	Author: Alexey Dubkov
*	Email:  alexey.dubkov@gmail.com
*	Web:    http://dubkov.com
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*/

var http = require('http');
var url = require('url');
var fs = require('fs');
var _ = require('underscore');

var redirectHandler = require('./redirectHandler');

var protocol = 'http://';		// Host protocol
var host = '127.0.0.1';		// Host address
var port = 8888;				// HTTP port

/**
* Server address - http://192.168.0.2:8888
*/
var server_addr = protocol + host +  (port == 80? '' : ':' + port);

/**
* Object structure with hashes and redirect addresses
*
* var urls = {
*	'/test': {on: redirectHandler.get, url:'http://dubkov.com/'},
*	@hash : {on: @function, url: @redirect_to}
* };
*
*/
var urls = {};

/**
* Save dumped hash of urls to disk
* @name saveDumpUrls
* @param {Object} arr Object with hashes and redirect addresses
*/
function saveDumpUrls(arr) {
	// define file to save
    var file = __dirname + '/data/urls.dat';
    // encode object with JSON
    var data = JSON.stringify(arr);
    // async write @data in @file
    fs.writeFile(file, data, 'utf8', function (err) {
        if (err) console.log('saveDumpUrls: ['+ file +']\t ERROR');
        console.log('saveDumpUrls: ['+ file +']\t OK');
        console.log('\t\t' + _.size(arr) + ' records was saved');
    });
}

/**
* Load dumped hash of urls from disk, and process it withit method .on
* @name loadDumpUrls
*/	
function loadDumpUrls() {
	// define file to load
	var file = __dirname + '/data/urls.dat';
	// if @file exist then
	fs.exists(file, function (exists) {
		if (exists) {
			// async read @file 
			fs.readFile(file, 'utf8', function(err, data){
				if (err) {
					var headers = {'Content-Type':'text/plain'};
					console.log('loadDumpUrls: [' + file + ']\t ERROR');
				} else 
				if (!_.isEmpty(data)) {
					// decode JSON @data to @urls
					urls = JSON.parse(data);
					console.log('loadDumpUrls: [' + file + ']\t OK');
					// to each urls[hash] object add method .on with function to redirect
					_.forEach(urls, function(key){
						_.extend(key, {on: redirectHandler.get});
					});
					console.log('\t\t' + _.size(urls) + ' records was loaded');					
				}
			})
		} else {
			console.log('loadDumpUrls: [' + file + '] isn\'t exists');
		}
	});
};

/**
* Start HTTP server
* @name start
* @route {function} route Router function
*/
exports.start = function start(route) {

	loadDumpUrls();

	/**
	* Process HTTP requests
	*
	* @name onRequest
	* @param {Object} req Request object
	* @param {Object} res Response object
	*/	
	function onRequest(req, res) {
		var pathname = url.parse(req.url).pathname;
		process.env['DEBUG'] ? console.log('\nRequest for ' + pathname):'';
		// Route request to appropriate handler
		route(req, res, pathname, urls);
	}

	/**
	* Create HTTP Server to listen @port
	*/
	http.createServer(onRequest).listen(port);
	console.log('Server has started at ' + protocol + host + (port == 80? '' : ':' + port));

	/**
	* Save @urls object to disk every 5 min
	*/
	setInterval(function(){ saveDumpUrls(urls); }, 5*60000);
}