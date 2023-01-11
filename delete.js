const fs = require('fs');
const axiosWithAuth = require('./axiosWithAuth');
const { successMessage, errorMessage } = require('./helpers');

//
// This script will delete any objects created by the 
// setup script and the setup-details.json file
//

// endpoints
const base = 'https://api.fivetran.com/v1';
const groups = `${base}/groups`;
const connectors = `${base}/connectors`;
const destinations = `${base}/destinations`;
const webhooks = `${base}/webhooks`;

// parse a previously created file if it exists and store it as objectIds
const filePath = 'setup-details.json';
let objectIds;

if (fs.existsSync(filePath)) {
    try {
        const data = fs.readFileSync(filePath);
        if(!data.length) {
            errorMessage(`${filePath} is empty.`);
        }
        objectIds = JSON.parse(data);
    } catch(error) {
        errorMessage(error);
    }
} else {
    errorMessage(`${filePath} does not exist, please run setup first.`);
}

// delete group and its connectors/destinations
const deleteObject = async (type, id) => {
    let responseMessage;
    try {
        const response = await axiosWithAuth(`${type}/${id}`, 'delete');
        responseMessage = response.data;
        console.log(`responseMessage: ${JSON.stringify(responseMessage)}`);
        if (response.status >= 200 && response.status < 300) {
            successMessage(responseMessage.message ? responseMessage.message : `${type} deleted, Status: ${response.status}`);
        } else {
            errorMessage(responseMessage.message ? responseMessage.message : `${type} didn't delete, Status: ${response.status}`);
        }
    } catch (error) {
        errorMessage(responseMessage.message ? responseMessage.message : response.status);
    }
}

const runDelete = async () => {
    try {
        if (objectIds.connector) {
            const connectorId = objectIds.connector;
            await deleteObject(connectors, connectorId);
        }
        if (objectIds.destination) {
            const destinationId = objectIds.destination;
            await deleteObject(destinations, destinationId);
        }
        if (objectIds.group) {
            const groupId = objectIds.group;
            await deleteObject(groups, groupId);
        }
        if (objectIds.webhook) {
            const webhookId = objectIds.webhook;
            await deleteObject(webhooks, webhookId);
        }

        // delete setup-details.json file
        fs.unlink(filePath, (error) => {
            if (error) {
                errorMessage((error));
            }
            successMessage('File deleted! Ready to run again!');
        });
    } catch (error) {
      errorMessage(error);
    }
  }

  runDelete();


