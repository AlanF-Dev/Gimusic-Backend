require("dotenv").config();

const qs = require("qs");
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;
const app = express();
const db = require("./database/queries");
const spotify = require("./spotify");
const saltRounds = 12;
const endpoint = "/API/V1"

const corsOption = {
	// origin: 'https://gimusic.netlify.app',
	origin: "http://localhost:5173",
	credentials: true,
	optionSuccessStatus: 200,
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOption));

app.get("/", (req, res) => {
	res.json({
		message: "GIMUSIC PROJECT",
	});
});

app.post(endpoint + "/signup", async (req, res) => {
	let hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
    await db.updateApiCount({api_id: 1})

	const result = await db.createUser({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
		usertype: 1,
	});
	res.json(result);
});

app.post(endpoint + '/login', async (req, res) => {
    await db.updateApiCount({api_id: 2})
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

app.post(endpoint + '/authenticate', async (req, res) => {
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

app.post(endpoint + "/logout", async (req, res) => {
    await db.updateApiCount({api_id: 3})
	res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
	res.json({
		success: true,
	});
});

app.get(endpoint + '/allUserRequests', async (req, res) => {
    await db.updateApiCount({api_id: 4})

    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            message: "No permission."
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        await db.updateUserApiCount({user_id: data.userid})
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

app.get(endpoint + '/apiRequests', async (req, res) => {
    await db.updateApiCount({api_id: 7})
    let token = req.cookies.token;
    if (!token || token == undefined) {
        res.json({
            message: "No permission."
        })
    } else {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        await db.updateUserApiCount({user_id: data.userid})
        if (data.usertype === "admin") {
            let results = await db.getApiRequests();
            res.json({
                success: results.success,
                api: results.api
            })
        } else {
            res.json({
                message: "No permission"
            })
        }
    }
})


app.get(endpoint + "/getSpotifyAuth", async (req, res) => {
	const token = await spotify.getTokenAuth();

	res.json({
		msg: token,
	});
});

app.get(endpoint + '/userProfile', async (req, res) => {
    await db.updateApiCount({api_id: 5})
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
            await db.updateUserApiCount({user_id: data.userid})
            let results = await db.getUserProfile({user_id: data.userid});
            res.json({
                success: results.success,
                user: results.user
            })
        }
    }
})

app.put(endpoint + '/updateUser', async (req, res) => {
    await db.updateApiCount({api_id: 6})
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
            await db.updateUserApiCount({user_id: data.userid})
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
	console.log(`APP LISTENING ON PORT: ${PORT}`);
});
