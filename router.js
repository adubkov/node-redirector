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

var sys = require('sys');
var qs = require('querystring');
var redirectHandler = require('./redirectHandler');
var rootHandler = require('./rootHandler');
var errorHandler = require('./errorHandler');
var staticHandler = require('./staticHandler');

/**
* Route HTTP request
*
* @name route
* @param {Object} req Request object
* @param {Object} res Response object
* @param {String} pathname '/' etc.
* @param {Object} urls object of hashes
*/
exports.route = function route(req, res, pathname, urls) {
	// Route '/' requests
	if (pathname == '/') {
		// if request '/' with method POST
		if (req.method == 'POST') {
			req.post = '';
            req.on('data', function (data) {
            	if (data.length > 1e4) {
            		// Probably flood attack
            		req.connection.destroy();
            	} else {
	            	req.post += data;
            	}
            });
            req.on('end', function () {
            	req.post = qs.parse(req.post)
				rootHandler.post(req, res, null, urls);
            });
		} else

		// if request '/' with method GET
		if (req.method == 'GET') {
			rootHandler.get(req, res);
		}

    } else

    // Route static content requests
    if (pathname.match('/css/') || pathname.match('/js/') || pathname.match('/images/')) {
    	// if request static content with method GET
        if (req.method == 'GET') {
        	staticHandler.get(req, res, pathname);
        }
	
	} else

	/**
	* Route redirect request.
	* Check if @urls not empty.
	*/
	if (!_.isEmpty(urls)) {
		// Check if @urls[hash] is an Object
		if (_.isObject(urls[pathname])) { 
			// Check @urls[hash] has a function
			if (_.has(urls[pathname],'on')) {
				// and so @urls[hash].on is a Function
				if (_.isFunction(urls[pathname].on)) {
					urls[pathname].on(req, res, urls[pathname]);
				} else {
					// if @urls[hash] isn't a function
					errorHandler.get(req, res, {
						err_code:500,
						err_msg:'Urls[' + pathname + '].on isn\'t a Function\t ERROR'
					});
				}
			} else {
				// if @urls[hash] hasn't ".on" function
				errorHandler.get(req, res, {
					err_code:500,
					err_msg:'Seems like urls[' + pathname + '] hasn\'t function \'.on\' \t ERROR'
				});
			}
		} else {
			// if we haven't apropriate request handler, then return HTTP error 404
			errorHandler.get(req, res, {err_code:404, err_msg:'Could not find apropriate handler for: ' + pathname});
		}
	} else
		// @urls is empty, nothing to respond
		errorHandler.get(req, res, {err_code:404, err_msg:'Urls is empty, nothing to respond ['+ pathname +']'});
}