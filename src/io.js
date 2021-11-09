const cookiesParser = require('socket.io-cookie')
const { db } = require('./db')
const { md5 } = require('./util')

const globalCache = {
    users: {}
}

function runWs(io) {

    io.use(cookiesParser)

    io.use((socket, next) => {
        const { username, password } = socket.handshake.query;
        let query = {};
        let token = socket.request.headers.cookie.token;
        if (username && password) { 
            Object.assign(query, { username, password: md5(password) })
        } else if (token) { 
            Object.assign(query, { _id: token })
        }
        if (Object.keys(query).length) {
            // console.log('query:', query)
            db.users.findOne(query, (err, doc) => {
                if (err) {
                    console.error(err)
                    return
                }
                if (doc === null) {
                    console.error('user data error')
                    return
                }
                const id = doc._id
                delete (doc['password']);
                socket.$user = doc

                globalCache.users[id] = {
                    username: doc.username,
                    score: doc.score || 0,
                };
                next()
            })
        } else {
            console.log('no log in')
            socket.disconnect(true)
        }
    })

    io.on('connection', function(socket) {
        const user = socket.$user;
        const loginTime = Date.now();
        socket.emit('connected', user._id)
        console.log('socket connect', user._id);
        // set users online state
        db.users.update({ _id: user._id }, { $set: { 
            online: true,
            cacheTime: loginTime,
        }})

        socket.emit('init/rank', globalCache.users);

        // broadcast user join
        io.emit('join', user);

        socket.on('message', function() {
            socket.emit('content')
        })

        socket.on('disconnect', function() {
            delete globalCache.users[user._id];
            // remove user online state
            db.users.update({ _id: user._id }, { 
                $unset: { 
                    online: true 
                },
                $inc: {
                    // update score according to user keep online time
                    score: (Date.now() - loginTime) / 1000
                }
            })
            io.emit('exit', user._id)
        })
    })
}
module.exports = runWs