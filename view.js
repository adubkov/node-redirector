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
var Jade = require('jade');

/**
* Return client language
* @name getClientLanguage
* @param {Object} req_headers Request headers object
* @return {String} lang 'en','ru'
* 
* http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
* 
*/
function getClientLanguage(req_headers) {
    // by default return 'en'
    var lang = 'en';
    if (_.isObject(req_headers["accept-language"])) {
        // Russian language
        if (req_headers["accept-language"].indexOf('ru') != -1) {
            lang = 'ru';
        }
        // Spanish language        
        if (req_headers["accept-language"].indexOf('es') != -1) {
            lang = 'es';
        }
    }
    return lang;
}

/**
* Render web layout
* @render view
* @param {String} view View name (/user)
* @param {String} action Action name (/user/add)
* @param {Object} locals Local template variables
* @param {Object} res Response object
*/
function render(view, action, locals, res) {
    // read template file
    var file = __dirname + '/views/'+ view + '/' + action + '/' + action +'.jade';
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log('view: [' + file + ']\tERROR\n' + err)
        } else {
            // render html
            var html = Jade.compile(data)(locals)
            // respond to client
            res.writeHead(200, {'Content-Type':'text/html'});
            res.end(html);
        }
    });
}

/**
* Display view
* @name show
* @param {Object} req Request object
* @param {Object} res Response object
* @param {String} view View name (/user)
* @param {String} action Action name (/user/add)
* @param {Object} addLocals Addition or changed local template variables
*/
exports.show = function show(req, res, view, action, addLocals) {
	// get client language
    var lang = getClientLanguage(req.headers);

    // read language file
    var file = __dirname +'/views/'+ view +'/'+ action + '/lang/'+ lang +'.json';
    fs.readFile(file, 'utf8', function(err, data){
        if (err) {
            var headers = {'Content-Type':'text/plain'}
            res.writeHead(500, headers);
            res.end(req.pathname + ' View not found');
            console.log('show: [' + file + ']\tERROR\n' + err)
        } else {
        	// Parse variables
            var locals = JSON.parse(data);
            // Add addition variables
            if (_.isObject(addLocals)) {
                locals = _.extend(locals, addLocals);
            }
            // Render layout
            render(view, action, locals, res);       
        }
    });
}