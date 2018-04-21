let localDebug = true
let port = 6968

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
            console.log('removing connection')
            removeConnection(ws)
        })

        ws.on('error', function error(e) {
            console.log('removing connection')
            removeConnection(ws)
        })

        ws.on('message', function incoming(msg) {
            console.log('Recieving request')
            for (i in connections) {
                try {
                    connections[i].send('play')
                } catch (e) {

                }
            }
        })

        connections.push(ws)
        console.log('Recieving connection')
    })
}

function removeConnection(sock) {
    var i = connections.indexOf(sock)
    if (i != -1) {
        connections.splice(i, 1)
    }
}

connect()
