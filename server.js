require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 3000;
const app = express();
const db = require('./database/queries')      

const corsOption = {
    origin: '*',
    credentials:true,
    optionSuccessStatus: 200,
};

app.use(express.json())
app.use(cors(corsOption));

app.post('/signup',(req, res) => {

})

app.post('/login', (req, res) => {
    
})