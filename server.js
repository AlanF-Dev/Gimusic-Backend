require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const app = express();
const db = require('./database/queries')    
const saltRounds = 12;  

const corsOption = {
    origin: '*',
    credentials:true,
    optionSuccessStatus: 200,
};

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
    res.json(result)
})

app.post('/login', async (req, res) => {
    
})

app.listen(PORT, () => {
    console.log(`APP LISTENING ON PORT: ${PORT}`)
})