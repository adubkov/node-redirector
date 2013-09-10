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

var fs = require('fs');
var mime = require('mime');


/**
* GET handler for static files
* @name get
* @param {Object} req Request object
* @param {Object} res Response object
* @param {String} pathname '/' etc.
*/
exports.get = function(req, res, pathname) {
	// read static file from disk
	var file = __dirname + '/static' + pathname;
	fs.readFile(file, 'utf8', function(err, data){
		if (err) {
			// Respond error
			var headers = {'Content-Type':'text/plain'}
			res.writeHead(404, headers);
			res.end(pathname + ' not found');
			// DEBUG
			process.env['DEBUG'] && console.log(__dirname + '/static' + pathname + '\t 404');
		} else {
			// detect mime-type
		    var mimeType = mime.lookup(pathname);
		    var headers = {'Content-Type':mimeType, 'Content-Length':data.length}
		    // Respond with file
			res.writeHead(200, headers);
			res.end(data);
			// DEBUG
			process.env['DEBUG'] && console.log(pathname + '\t 200');
		}
	});
	
}