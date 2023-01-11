const axios = require('axios');
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
        errorMessage(response.message);
    }
} else {
    errorMessage(`${filePath} does not exist, please run setup first.`);
}

// delete group and its connectors/destinations
const deleteGroup = async (groupId) => {
    try {
        const response = await axiosWithAuth(`${groups}/${groupId}`, 'delete');
        const responseMessage = response.data;

        if (response.status === 200) {
            successMessage(responseMessage.message);
        } else {
            errorMessage(responseMessage.message);
        }
    } catch (error) {
        errorMessage(error.message);
    }
}

const deleteDestination = async (destinationId) => {
    try {
        const response = await axiosWithAuth(`${destinations}/${destinationId}`, 'delete');
        const responseMessage = response.data;

        if (response.status === 200) {
            successMessage(responseMessage.message);
        } else {
            errorMessage(responseMessage.message);
        }
    } catch (error) {
        errorMessage(error.message);
    }
}


const runDelete = async () => {
    try {
        if (objectIds.destination) {
            const destinationId = objectIds.destination;
            await deleteDestination(destinationId);
        }
        if (objectIds.group) {
            const groupId = objectIds.group;
            await deleteGroup(groupId);
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


