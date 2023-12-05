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

const getAllUserRequests = async(data) => {
    let getUserSQL = `
        SELECT user_id, username, email, IFNULL((get_requests + post_requests),0) AS requests
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
        SELECT user_id, username, email, IFNULL(get_requests, 0) AS get_requests, IFNULL(post_requests, 0) AS post_requests
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

module.exports = {
    createUser, getUser, updateUser, getAllUserRequests, getUserProfile
}