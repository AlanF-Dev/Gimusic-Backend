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
    origin: 'https://gimusic.netlify.app/',
    credentials:true,
    optionSuccessStatus: 200,
};

app.use(cookieParser());
app.use(express.json())
app.use(cors(corsOption));

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
    console.log(req.body.username);
    let results = await db.getUser({username: req.body.username});
    console.log(results);
    if (results.user === undefined){
        console.log("4")
        let message = "An account with that email has not been found in our records."
        res.json({
            success: false,
            message: message
        });
    } else {
        console.log("1")
        if ( bcrypt.compareSync(req.body.password, results.user.hashedPassword)){
            console.log("2")
            let token = jwt.sign(
                { username: results.user.username, email: results.user.email, usertype: results.user.user_type },
                "secretkey",
                { expiresIn: "1h" }
            )
            res.cookie('token', token, { secure: false, maxAge: 3600, httpOnly: true })
            res.json({
                success: true,
            })
        } 
        else {
            console.log("3")
            let message = "Password does not match the email in our records. Try again."
            res.json({
                success: false,
                message: message
            });
        }
    }
})

app.listen(PORT, () => {
    console.log(`APP LISTENING ON PORT: ${PORT}`)
})