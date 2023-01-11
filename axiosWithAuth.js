
const axios = require('axios');
require('dotenv').config();
const { successMessage, errorMessage } = require('./helpers');

// auth
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const token = `${key}:${secret}`;
const base64Encoded = new Buffer.from(token).toString('base64');

// API Request abstraction with default GET method
const axiosWithAuth = async (endpoint, method = 'get', data = {}) => {
    try {
        const response = await axios({
            url: endpoint,
            method: method,
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Encoded}`
            }
        });
        return response;
    } catch (error) {
        errorMessage(`Error making ${method} request to ${endpoint}: ${error}`);
    }
};

module.exports = axiosWithAuth;