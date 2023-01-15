const axiosWithAuth = require('./axiosWithAuth');
const { successMessage, errorMessage } = require('./helpers');
const chalk = require('chalk');
const os = require('os');

let connectorStatus;
let connectorPollingInterval = 10000;
let connectorPollingAttempts = 0;
let maxConnectorPollingAttempts = 50;

const runPolling = async (endpoint, connectorId, field, value) => {
    return new Promise(async (resolve, reject) => {
      
        const intervalId = setInterval(async () => {
            if (connectorPollingAttempts >= maxConnectorPollingAttempts) {
                clearInterval(intervalId);
                reject(`Connector ${connectorId} did not change status to ${value} after ${connectorPollingAttempts} attempts`);
            } 
            try {
                const response = await axiosWithAuth(`${endpoint}/${connectorId}`, 'get');
                const responseMessage = response.data;
                connectorStatus = responseMessage.data.status[field];

                console.log(os.EOL);
                console.log(chalk.yellow(`Connector status: ${connectorStatus}`));
                console.log(chalk.yellow(`Polling attempts: ${connectorPollingAttempts} out of ${maxConnectorPollingAttempts}`));
                connectorPollingAttempts++;
                if (field === 'setup_state') {
                    console.log("Authenticate the Connect Card to get to the next step!");
                }
                if (connectorStatus === value) {
                    clearInterval(intervalId);
                    resolve(`Connector ${connectorId} ${field} is ${value}`);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error)
            }
        }, connectorPollingInterval);
    });
};

module.exports = runPolling;