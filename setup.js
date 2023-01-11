const randomWords = require('random-words');
const fs = require('fs');
const os = require('os');
require('pretty-error').start();
const chalk = require('chalk');
// custom functions
const axiosWithAuth = require('./axiosWithAuth');
const writeObjectToFile = require('./writeFiles');
const runPolling = require('./connectorStatus');
const { successMessage, errorMessage } = require('./helpers');

// 
// This file will run through our end-to-end flow
// Creating a group, destination, connector, and webhook
// It will also pull a schema before sync, modify it
// and then run a sync. When it receives the sync_end webhook event,
// it will pause the connector.
//

// We'll keep track of the Fivetran objects we create with another object!
// We'll write this object to a file called setup-details.json so we can easily
// delete at a later time. 
const filePath = 'setup-details.json';
const objectIds = {
    group: '',
    connector: '',
    destination: '',
    webhook: ''
}

// check if we've run this before and haven't deleted the file or objects
if (fs.existsSync(filePath)) {
    errorMessage(`${filePath} already exists, please run the delete script or delete the setup-details.json file`);
} else {
    writeObjectToFile(filePath, objectIds);
}

// endpoints
const base = 'https://api.fivetran.com/v1';
const groupsEndpoint = `${base}/groups`;
const connectorsEndpoint = `${base}/connectors`;
const destinationsEndpoint = `${base}/destinations`;
const webhooksEndpoint = `${base}/webhooks/account`;

// Group Object (feel free to rename)
// https://fivetran.com/docs/rest-api/groups
const groupObject = { "name": 'pbf_snowflake_jan10' };

// Destination Object
// https://fivetran.com/docs/rest-api/destinations
// Follow setup guide for snowflake up to step 2 for an easy example
// https://fivetran.com/docs/destinations/snowflake/setup-guide
const destinationObject = {
    "group_id": '',
    "service":"snowflake",
    "region":"GCP_US_EAST4",
    "time_zone_offset":"-5",
    "config":{
        "host":process.env.DESTINATION_HOST,
        "port":443,
        "database": process.env.DESTINATION_DATABASE,
        "auth":"PASSWORD",
        "user": process.env.DESTINATION_USER,
        "password":process.env.DESTINATION_PASSWORD
    }
};

// Webhook Object
// https://fivetran.com/docs/rest-api/webhooks
// Simple account level webhook to receive all sync_end events
const webhookObject = {
    "url": process.env.WEBHOOK_URL,
    "events": [
      "sync_end"
    ],
    "active": true,
    "secret": process.env.SIGNATURE_SECRET
  };

// Connector Object
// https://fivetran.com/docs/rest-api/connectors
// Create github connector and return connect card URL
// We'll poll after creation to check for when auth is complete
const connectorObject = {
    "service": "github",
    "paused": true,
    "pause_after_trial": true,
    "group_id": '',
    "config": {
        "schema": "github"
    },
    "connect_card_config": {
        "redirect_uri": "https//www.jimmyhooker.com"
    }
}
let connectorId;
let connectCardUrl;

// Function to create against the Fivetran API
const createObject = async (resource, endpoint, operation, requestObject) => {
    let responseMessage;
    try {
        // console.log(requestObject)
        const response = await axiosWithAuth(endpoint, operation, requestObject);
        // console.log(response)
        responseMessage = response.data;
        console.log(responseMessage)
        // parse the response for the id and update our objectIds object
        let objectId;
        if (resource == 'webhook') {
            // webhook responses don't have a data object
            objectId = responseMessage.id;
        } else if (resource == 'connector') {
            connectCardUrl = responseMessage.data.connect_card.uri;
            objectId = responseMessage.data.id;
            successMessage(connectCardUrl);
        } else {
            objectId = responseMessage.data.id;
        }
        objectIds[resource] = objectId;

        // write the id to a json file for later deletion
        writeObjectToFile(filePath, objectIds);
        successMessage(`${resource} ${objectId} created`);
    } catch (error) {
        if (resource == 'webhook') {
            errorMessage(`${error}${os.EOL}${responseMessage.data}${os.EOL} Please check your webhook url is live, https, and able to respond with 2xx codes`);
        }
        errorMessage(responseMessage.data);
    }
}

  const runSetup = async () => {
    try {
        // Create Group
        await createObject('group', groupsEndpoint, 'post', groupObject);
        // update our destinationObject and connectorObject's now that we have a group ID
        destinationObject.group_id = objectIds.group;
        connectorObject.group_id = objectIds.group;

        // Create Destination
        await createObject('destination', destinationsEndpoint, 'post', destinationObject);

        // Create Webhook
        await createObject('webhook', webhooksEndpoint, 'post', webhookObject);

        // Create Connector
        await createObject('connector', connectorsEndpoint, 'post', connectorObject);
        // update our connectorId variable now that we have it
        connectorId = objectIds.connector;

        // Poll for connector status
        await runPolling(connectorsEndpoint, connectorId);

        console.log("does this run right away because of the await?");
    } catch (error) {
      errorMessage(error);
    }
  }

  runSetup();


// once connector is in auth state, retrieve the schema

// modify the schema to remove everything but a few columns

// unpause the connector

// listen on endpoint for sync_end webhook event

// once you get first sync_end event, pause the connector


