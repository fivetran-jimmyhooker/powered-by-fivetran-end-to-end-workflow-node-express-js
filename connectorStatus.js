const axiosWithAuth = require('./axiosWithAuth');
const { successMessage, errorMessage } = require('./helpers');
const chalk = require('chalk');

// Poll for connector status
let connectorStatus;
let connectorPollingInterval = 5000;
let connectorPollingAttempts = 0;
let maxConnectorPollingAttempts = 20;

const base = 'https://api.fivetran.com/v1';
const connectorsEndpoint = `${base}/connectors`;
const connectorId = 'refinance_patronage';
const fullEndpoint = `${connectorsEndpoint}/${connectorId}`;

const pollConnector = async (endpoint, connectorId) => {
    try {
        const response = await axiosWithAuth(`${endpoint}/${connectorId}`, 'get');
        const responseMessage = response.data;
        connectorStatus = responseMessage.data.status.setup_state;
        console.log(chalk.yellow(`Connector status: ${connectorStatus}`));
        connectorPollingAttempts++;
    } catch (error) {
        errorMessage(error);
    }
}

const runPolling = (endpoint, connectorId) => {
    const intervalId = setInterval(() => {
        console.log(`connectorPollingAttempts: ${connectorPollingAttempts}`)
        if (connectorStatus === 'connected') {
            clearInterval(intervalId);
            successMessage(`Connector ${connectorId} connected`);
        } else if (connectorPollingAttempts >= maxConnectorPollingAttempts) {
            clearInterval(intervalId);
            errorMessage(`Connector ${connectorId} did not connect after ${connectorPollingAttempts} attempts`);
        } else {
            pollConnector(endpoint, connectorId);
        }
    }, connectorPollingInterval);
}



// runPolling(connectorsEndpoint, connectorId);

module.exports = runPolling;