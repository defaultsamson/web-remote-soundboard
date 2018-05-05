let localDebug = false
let port = 6968
let COOLDOWN = 2000

const WebSocket = require('ws');
const express = require('express')
const https = require('https')
const fs = require('fs')

var wss = null
var connections = []

function connect() {
    if (localDebug) {
        wss = new WebSocket.Server({
            port: port
        })
    } else {
        // This line is from the Node.js HTTPS documentation.
        var options = {
            key: fs.readFileSync('/ssl/www_samsonclose_me.key'),
            cert: fs.readFileSync('/ssl/www_samsonclose_me.crt')
        }

        // Create a service (the app object is just a callback).
        var app = express()

        // Create an HTTPS service 
        var httpsServer = https.createServer(options, app).listen(port)

        wss = new WebSocket.Server({
            server: httpsServer
        })
    }

    wss.on('connection', function connection(ws) {

        ws.on('close', function close() {
            removeConnection(ws)
            updateUsers()
        })

        ws.on('error', function error(e) {
            removeConnection(ws)
            updateUsers()
        })

        ws.on('message', function incoming(data) {
            try {
                var pack = JSON.parse(data)
                switch (pack.type) {
                    case 'play':
                        if (Date.now() - ws.last > COOLDOWN) {
                            ws.last = Date.now()
                            broadcast({
                                type: 'play'
                            })
                        }
                        break
                }
            } catch (e) {

            }
        })

        ws.last = Date.now()
        connections.push(ws)
        updateUsers()
    })

    console.log('Server Started')
}

function broadcast(obj) {
    for (i in connections) {
        try {
            connections[i].send(JSON.stringify(obj))
        } catch (e) {

        }
    }
}

function updateUsers() {
    broadcast({
        type: 'users',
        num: connections.length
    })
}

function removeConnection(sock) {
    var i = connections.indexOf(sock)
    if (i != -1) {
        connections.splice(i, 1)
    }
}

connect()
