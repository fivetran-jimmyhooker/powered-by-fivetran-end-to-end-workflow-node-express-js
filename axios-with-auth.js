const axios = require("axios");
require("dotenv").config();
const os = require("os");
const chalk = require("chalk");

//
// Utility function to send authenticated requests to the Fivetran API
//

// Auth
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const token = `${key}:${secret}`;
const base64Encoded = new Buffer.from(token).toString("base64");

// API Request abstraction with default GET method
const axiosWithAuth = async (endpoint, method = "get", data = {}) => {
  let response;
  console.log(os.EOL);
  console.log(chalk.blue.bold(">> Request"));
  console.log(
    chalk.blue(
      `Making a ${chalk.bold(method.toUpperCase())} request to ${endpoint}`
    )
  );
  if (Object.keys(data).length > 0) {
    console.log(data);
  }

  try {
    response = await axios({
      url: endpoint,
      method,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64Encoded}`,
      },
    });

    console.log(os.EOL);
    console.log(chalk.green.bold("<< Response"));
    console.log(response.data);
    return response;
  } catch (error) {
    console.log(error.response.data);
    process.exit(1);
  }
};

module.exports = axiosWithAuth;
