const qs = require('qs')
const axios = require('axios');

const getTokenAuth = async() => {
    const client_id = "11078043b53844f09e4cb370d914cf46"
    const client_secret = "6d888e6cde844cc3928205f1aeecd207"
    const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64')

    const token_url = 'https://accounts.spotify.com/api/token'
    const data = qs.stringify({'grant_type':'client_credentials'})

    const response = await axios.post(token_url, data, {
        headers:{
            'Authorization': `Basic ${auth_token}`,
            'Content-Type' : `application/x-www-form-urlencoded`
        }
    })
    
    return response.data.access_token
}

module.exports = {
    getTokenAuth
}