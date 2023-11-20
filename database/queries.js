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

module.exports = {
    createUser
}