var dnode = require('dnode');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

exports.broadcast = function () {
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var em = new EventEmitter;
    var server = dnode(function (client,conn) {
        conn.on('ready', function () {
            em.on('message', client.message);
        });
        
        conn.on('end', function () {
            em.removeListener('message', client.message);
        });
        
        this.message = function (msg) {
            em.emit('message', client.name + ' says: ' + msg);
        };
    }).listen(port);
    
    var recv = { 0 : [], 1 : [], 2 : [] };
    
    server.on('ready', function () {
        dnode({
            name : '#0',
            message : function (msg) { recv[0].push(msg) },
        }).connect(port, function (remote) {
            setTimeout(function () {
                remote.message('hello!');
            }, 250);
        });
        
        dnode({
            name : '#1',
            message : function (msg) { recv[1].push(msg) },
        }).connect(port, function (remote) {
            setTimeout(function () {
                remote.message('hey');
            }, 500);
        });
        
        dnode({
            name : '#2',
            message : function (msg) { recv[2].push(msg) },
        }).connect(port, function (remote) {
            setTimeout(function () {
                remote.message('wowsy');
            }, 750);
        });
    });
    
    setTimeout(function () {
        server.end();
        server.close();
        assert.equal(
            util.inspect(recv[0]),
            "[ '#0 says: hello!', '#1 says: hey', '#2 says: wowsy' ]",
            "#0 didn't get the right messages"
        );
        assert.equal(
            util.inspect(recv[0]),
            util.inspect(recv[1]),
            "#1 didn't get the messages"
        );
        assert.equal(
            util.inspect(recv[0]),
            util.inspect(recv[2]),
            "#2 didn't get the messages"
        );
    }, 1500);
};
