const database = require('../databaseConnection');

const createUser = async(data) => {
    let createUserSQL = `
        INSERT INTO user
        (username, email, hashedPassword, user_type_id)
        VALUES
        (?, ?, ?, ?);
    `

    let param = [data.username, data.email, data.password, data.usertype];

    try{
        await database.query(createUserSQL, param);
        return {success: true}
    }
    catch(e){
        return {success: false}
    }
}

const getUser = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, hashedPassword, user_type
        FROM user
        JOIN user_type ON user_type.user_type_id = user.user_type_id
        WHERE username = (?);
    `;

    let param = [data.username];

    try{
        const results = await database.query(getUserSQL, param);
        return {user: results[0][0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const updateUser = async(data) => {
    let updateUserSQL = `
        UPDATE user
        SET username = (?), email = (?)
        WHERE user_id = (?);
    `

    let param = [data.username, data.email, data.userid];

    try{
        await database.query(updateUserSQL, param);
        return {success: true}
    }
    catch(e){
        return {success: false}
    }
}

const getApiRequests = async (data) => {
    let getApiSQL = `
        SELECT *
        FROM api;
    `;

    try{
        const results = await database.query(getApiSQL);
        return {api: results[0], success: true};
    }
    catch(e){
        return {success: false}
    }
}


const getAllUserRequests = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, IFNULL(requests,0) AS requests
        FROM user
        LEFT JOIN api_requests ON api_requests.frn_user_id = user.user_id;
    `;

    try{
        const results = await database.query(getUserSQL);
        return {users: results[0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const getUserProfile = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, IFNULL(requests, 0) AS requests
        FROM user
        LEFT JOIN api_requests ON api_requests.frn_user_id = user.user_id
        WHERE user.user_id = (?);
    `;

    let param = [data.user_id];

    try{
        const results = await database.query(getUserSQL, param);
        return {user: results[0][0], success: true};
    }
    catch(e){
        return {success: false}
    }
}

const updateApiCount = async(data) => {
    let updateCount = `
        UPDATE api
        SET requests = requests + 1
        WHERE api_id = (?);
    `;

    let param = [data.api_id];

    try {
        const results = await database.query(updateCount, param)
        return {success: true}
    }
    catch(e) {
        return {success: false}
    }
}

const updateUserApiCount = async(data) => {
    let updateCount = `
        INSERT INTO api_requests (frn_user_id, requests)
        VALUES (?, 1)
        ON DUPLICATE KEY
        UPDATE requests = requests + 1;
    `;

    let param = [data.user_id];

    try {
        const results = await database.query(updateCount, param)
        return {success: true}
    }
    catch(e) {
        return {success: false}
    }
}

module.exports = {
    createUser, getUser, updateUser, getApiRequests, getAllUserRequests, getUserProfile, updateApiCount, updateUserApiCount
}