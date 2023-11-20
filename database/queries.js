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

module.exports = {
    createUser, getUser
}