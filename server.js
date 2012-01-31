#!/usr/bin/env node

var express = require('express'),
    app = express.createServer(),
    util = require('./util'),
    https = require('https');

var cache = {
};

var getRemote = function(url, cb) {
    console.log('Fetching Remote Resource', url);
    https.get({
        host: 'raw.github.com',
        path: '/yui/yui3/master/build/' + url
    }, function(res) {
        var d = '';
        res.on('data', function(chunk) {
            d += chunk;
        });
        res.on('end', function() {
            cb(d);
        });
    });
};

setInterval(function() {
    console.log('Clearing Cache');
    cache = {};
}, (5 * 60 * 1000));

var get = function(urls, cb) {
    if (typeof urls === 'string') {
        urls = [urls];
    }
    var stack = new util.Stack(),
    data = [];

    urls.forEach(function(u, k) {
        if (cache[u]) {
            data[k] = cache[u].data;
        } else {
            getRemote(u, stack.add(function(d) {
                cache[u] = {
                    data: d
                };
                data[k] = d;
            }));
        }
    });

    stack.done(function() {
        cb(data.join('\n'));
    });
};

var stamp = function(str) {
    return str.replace(/@VERSION@/g, 'yui-master-combo');
};

app.get('/', function(req, res) {
    var filter = req.query.filter || 'min',
        url = 'yui/yui-min.js';

    switch (filter) {
        case 'raw':
            url = 'yui/yui.js';
            break;
        case 'debug':
            url = 'yui/yui-debug.js';
            break;
    }

    get(url, function(data) {
        res.contentType('.js');
        var host = req.headers.host;
        var append = '\n/* Adding global config */\n\n';
        append += 'YUI.applyConfig({\n';
        append += '     root: "",\n';
        append += '     filter: "' + filter + '",\n';
        append += '     comboBase: "http:/'+'/' + host + '/combo?"\n';
        append += '});\n';
        append += 'YUI.version = "yui-master-combo";\n';

        data += append;
        data = stamp(data);
        res.send(data);
    });
});

app.get('/combo', function(req, res) {
    var urls = Object.keys(req.query);
    console.log('Fetching', urls);
    get(urls, function(data) {
        res.contentType(urls[0]);
        data = stamp(data);
        res.send(data);
    });
});

app.get('*', function(req, res) {
    res.send(404);
});

app.listen(5000);
