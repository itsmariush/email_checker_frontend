const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const http = require("http");

const app = express();
const PORT = 3000;

const MAIL_PORT = 8081;

const myusername = 'user1'
const mypassword = 'mypassword'

var session;

app.listen(PORT, () => {
    console.log("Listening on port 3000");
});

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "supersecretkeyForemailwishreachertest",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));
app.use(cookieParser());

app.get('/',(req,res) => {
    session=req.session;
    if(session.userid){
        res.send("<a href=\'/logout'>Logout</a>");
    }else
    res.sendFile('views/index.html',{root:__dirname})
});

app.post('/user',(req,res) => {
    if(req.body.username == myusername && req.body.password == mypassword){
        session=req.session;
        session.userid=req.body.username;
        console.log(req.session)
        //res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
        res.sendFile('views/user.html', {root:__dirname});
    }
    else{
        res.send('Invalid username or password');
    }
});

app.post('/checkmail', (req, res) => {
    session=req.session;
    if(!session.userid){
        res.send("Need to login");
        return;
    }
    var data = JSON.stringify({
        'to_email': req.body.email,
    });

    var urlparams = {
        host: 'localhost',
        port: 8081,
        path: '/v0/check_email',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        }
    };

    var rest = http.request(urlparams, (res1) => {
        let data;
        res1.setEncoding('utf8');
        res1.on('data', (chunk) => {
            data = chunk;
        });
        res1.on('end', () => {
            console.log('No more data in response.');
            res.send(`<html><pre><code>${data}</code></pre></html>`);
        });
    });

    rest.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    
    rest.write(data);
    rest.end();
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});
