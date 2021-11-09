const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs')

const server = require('https').createServer({
    key: fs.readFileSync('./https/server.key'),
    cert: fs.readFileSync('./https/server.crt'),
}, app);

const io = require('socket.io')(server);
const bodyParser = require('body-parser')
const { db } = require('./db')
const { md5 } = require('./util');

const viewPath = path.join(__dirname, '../templates');
console.log(viewPath)
app.set('views', viewPath);
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

require('./io')(io);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', function(req, res) {
    res.redirect('/login.html')
})
app.post('/login', function(req, res) {
    const { username, password: UnEncodePassword } = req.body
    if (!username || !UnEncodePassword) {
        res.send({
            succ: false,
            msg: 'input invalid'
        })
        return
    }
    // encode password with md5
    const password = md5(UnEncodePassword)
    db.users.findOne({ username, password }, function (err, doc) {
        if (err) {
            console.error(err)
            res.sendStatus(500)
            return
        }
        if (doc === null) {
            res.send({
                succ: false,
                msg: 'username or password incorrect!'
            })
            return
        }
        // login success!
        res.cookie('token', doc._id, {
            'maxAge': 2 * 3600 * 1000, // 2 hours live
        })
        res.send({
            succ: true,
            doc: doc,
        })
    })
})

app.get('/register', function(req, res) {
    res.redirect('/register.html');
})
app.post('/register', function(req, res) {
    const { username, password: UnEncodePassword } = req.body
    if (!username || !UnEncodePassword) {
        res.sendStatus(403);
        return
    }
    db.users.findOne({ username }, (err, doc) => {
        if (err) {
            console.error(err)
            res.sendStatus(403);
            return
        }
        if (doc !== null) {
            res.send({
                succ: false,
                msg: 'duplicate username'
            })
            return
        }
        // encode password with md5
        const password = md5(UnEncodePassword)
        db.users.insert({ username, password }, (err, doc) => {
            if (err) {
                console.error(err)
                return
            }
            res.send({
                succ: true,
                doc: doc,
            })
        })
    })
    
})

app.get('/logout', function(req, res) {
    res.clearCookie('token')
    res.redirect('/login')
})

// dump all users
app.get('/users', function(req, res) {
    db.users.find({}, (err, docs) => {
        res.send(docs)
    })
})

app.get('/', function(req, res) {
    res.type('html')
    res.render('index', {})
})

app.use('/', express.static(path.join(__dirname, '../static')))

let port = process.env.PORT || 3000;

server.listen(port, () => console.log(`server running at :${port}`));