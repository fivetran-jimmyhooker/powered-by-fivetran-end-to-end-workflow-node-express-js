
const axios = require('axios');
require('dotenv').config();
const { successMessage, errorMessage } = require('./helpers');
const os = require('os');
const chalk = require('chalk');

// auth
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const token = `${key}:${secret}`;
const base64Encoded = new Buffer.from(token).toString('base64');

// API Request abstraction with default GET method
const axiosWithAuth = async (endpoint, method = 'get', data = {}) => {
    let response;
    console.log(os.EOL);
    console.log(chalk.blue(`Making a ${method.toUpperCase()} request to ${endpoint}`));
    if (Object.keys(data).length !== 0) {
        console.log(data);
    }
    try {
        response = await axios({
            url: endpoint,
            method: method,
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Encoded}`
            }
        });
        console.log(os.EOL);
        console.log(chalk.green("Response"));
        console.log(response.data);
        return response;
    } catch (error) {
        console.log(error.response.data);
        process.exit(1);
    }
};

module.exports = axiosWithAuth;