require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;
const app = express();
const db = require('./database/queries')    
const saltRounds = 12;  

const corsOption = {
    // origin: 'https://gimusic.netlify.app',
    origin: 'http://localhost:5173',
    credentials:true,
    optionSuccessStatus: 200,
};

app.use(cookieParser());
app.use(express.json())
app.use(cors(corsOption));

app.get('/', (req, res) => {
    res.json({
        message: "GIMUSIC PROJECT"
    })
})

app.post('/signup', async (req, res) => {
    let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

    const result = await db.createUser({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        usertype: 1
    });
    res.json(result);
})

app.post('/login', async (req, res) => {
    let results = await db.getUser({username: req.body.username});
    if (results.user === undefined){
        let message = "An account with that username has not been found in our records."
        res.json({
            success: false,
            message: message
        });
    } else {
        if ( bcrypt.compareSync(req.body.password, results.user.hashedPassword)){
            let token = jwt.sign(
                { userid: results.user.user_id, username: results.user.username, email: results.user.email, usertype: results.user.user_type },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            )
            res.cookie('token', token, { maxAge: 3600000, httpOnly: true, sameSite: 'none', secure: true })
            res.json({
                success: true,
            })
        } 
        else {
            let message = "Password does not match the username in our records. Try again."
            res.json({
                success: false,
                message: message
            });
        }
    }
})

app.post('/authenticate', async (req, res) => {
    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            success: false,
            admin: false
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        if (data.userid == undefined || data.username == undefined || data.email == undefined || data.usertype == undefined) {
            res.json({
                success: false,
                admin: false
            })
        } else {
            if (data.usertype === "user") {
                res.json({
                    success: true,
                    admin: false
                })
            } else if (data.usertype === "admin") {
                res.json({
                    success: true,
                    admin: true
                })
            } else {
                res.json({
                    sucess: false,
                    admin: false
                })
            }
        }
    }
})

app.post('/logout', async (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({
        success: true
    })
})

app.get('/allUserRequests', async (req, res) => {
    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            message: "No permission."
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        if (data.usertype === "admin") {
            let results = await db.getAllUserRequests();
            res.json({
                success: results.success,
                users: results.users
            })
        } else {
            res.json({
                message: "No permission"
            })
        }
    }
})

app.get('/userProfile', async (req, res) => {
    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            success: false
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        if (data.userid == undefined || data.username == undefined || data.email == undefined || data.usertype == undefined) {
            res.json({
                success: false
            })
        } else {
            let results = await db.getUserProfile({user_id: data.userid});
            res.json({
                success: results.success,
                user: results.user
            })
        }
    }
})

app.post('/updateUser', async (req, res) => {
    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            success: false
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        if (data.userid == undefined || data.username == undefined || data.email == undefined || data.usertype == undefined) {
            res.json({
                success: false
            })
        } else {
            let results = await db.updateUser({userid: data.userid, username: req.body.username, email: req.body.email});
            let newtoken = jwt.sign(
                { userid: data.user_id, username: req.body.username, email: req.body.email, usertype: data.user_type },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            )
            res.cookie('token', newtoken, { maxAge: 3600000, httpOnly: true, sameSite: 'none', secure: true })
            res.json({
                success: results.success
            })
        }
    }
})

app.listen(PORT, () => {
    console.log(`APP LISTENING ON PORT: ${PORT}`)
})