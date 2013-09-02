/**
*   Author: Alexey Dubkov
*   Email:  alexey.dubkov@gmail.com
*   Web:    http://dubkov.com
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*/

var fs = require('fs');
var sys = require('sys');

var _ = require('underscore');

var view = require('./view');
var redirectHandler = require('./redirectHandler');

var test_arr = [];

function getClientLanguage(req_headers) {
    var lang = 'en';
    if (_.isObject(req_headers["accept-language"])) {
        if (req_headers["accept-language"].indexOf('ru') != -1) {
            lang = 'ru';
        }
    }
    return lang;
}

function loadLanguageResource(req, res, viewName, addLocals) {
    var lang = getClientLanguage(req.headers);

    fs.readFile(__dirname +'/views/'+ viewName +'/'+ lang +'.json', 'utf8', function(err, data){
        if (err) {
            var headers = {'Content-Type':'text/plain'}
            res.writeHead(404, headers);
            res.end(pathname + ' not found');
            console.log(__dirname + '/views/'+ viewName +'/'+ lang +'.json' + '\t 404');
        } else {
            var locals = JSON.parse(data);
            if (_.isObject(addLocals)) {
                locals = _.extend(locals, addLocals);
            }
            view.view(viewName, locals, res);       
        }
    });
}

function base_encode(num) {
    if (typeof num !== 'number') num = parseInt(num);
    var enc = '', alpha='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var div = num,mod;
    while (num >= 58) {
        div = num/58;
        mod = num-(58*Math.floor(div));
        enc = ''+alpha.substr(mod, 1) + enc;
        num = Math.floor(div);
    }
    return (div) ? '' + alpha.substr(div, 1) + enc : enc;
}

function isUrl(value) {
    var urlregex = new RegExp("^(http|https)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return true;
    }
    return false;
}

function getNewKey(arr){
    var i = 0, n = _.size(arr);
    while (n) {
      i += 1; n = ~~(n / 10);
    }
    i = Math.pow(10,i);

    var max_idx = (_.size(arr) >= (i * .1) ? i :_.size(arr)*10);
    var min_idx = 1;
    while (true) {
        var tmp = _.random(min_idx, max_idx);
        var tmp_hash = '/' + base_encode(tmp);
        if (!_.has(arr, tmp_hash)) {
            new_key = tmp_hash;
            test_arr.push(tmp);
            break;
        }
    }
    /*var arr = test_arr.sort();
    console.log(arr);
    console.log('Size: ' + _.size(arr));*/
    process.env['DEBUG'] ? console.log('getNewKey: [' + new_key + '];\tTotal keys: ' + _.size(arr)):'';
    return new_key;
};

exports.get = function(req, res, next) {
    loadLanguageResource(req, res, 'index');
	process.env['DEBUG'] ? console.log('GET /'):'';
}

exports.post = function(req, res, next, urls) {
    var idx_hash = getNewKey(urls);

    if (_.isString(req.post.url)) 
        if (isUrl(req.post.url)) {
            urls[idx_hash] = {on: redirectHandler.get, url: req.post.url};

            var data = JSON.stringify({url: idx_hash});
            
            var headers = {'Content-Type':'application/json','Content-Length':data.length}
            res.writeHead('200', headers);
            res.end(data);
        } else {
            console.log('ERROR \t isUrl(' + req.post.url +') \t FALSE');
            var headers = {'Content-Type':'text/plain'}
            res.writeHead('500', headers);
            res.end();            
        }
    process.env['DEBUG'] ? console.log('POST '+ req.post.url +' '+ JSON.stringify({url: idx_hash})):'';
}