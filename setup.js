// packages
const axios = require('axios');
const randomWords = require('random-words');
const clc = require('cli-color');
const fs = require('fs');
// custom functions
const axiosWithAuth = require('./axiosWithAuth');
const writeObjectToFile = require('./writeFiles');
const { successMessage, errorMessage } = require('./helpers');

// 
// This file will run through our end-to-end flow
// Creating a group, destination, connector, and webhook
// It will also pull a schema before sync, modify it
// and then run a sync. When it receives the sync_end webhook event,
// it will pause the connector.
//

// do some basic stuff to keep track of the objects we create, 
// making it easy to delete when we're done if we'd like
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
const groups = `${base}/groups`;
const connectors = `${base}/connectors`;
const destinations = `${base}/destinations`;

// create group
const createGroup = async (name) => {
    try {
        const requestObject = { "name": name };
        const response = await axiosWithAuth(groups, 'post', requestObject);
        const responseMessage = response.data;
        // parse the response for the group id
        const groupId = responseMessage.data.id;
        objectIds.group = groupId;

        // write the group id to a json file for later deletion
        writeObjectToFile(filePath, objectIds);
        successMessage(`Group ${groupId} created`);
    } catch (error) {
        errorMessage(error);
    }
  };

// create destination on Fivetran, follow setup guide for snowflake up to step 2 for an easy example
// https://fivetran.com/docs/destinations/snowflake/setup-guide

const createDestination = async () => {
    try {
        const groupId = objectIds.group;
        const requestObject = {
            "group_id": groupId,
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

        console.log
        const response = await axiosWithAuth(destinations, 'post', requestObject);
        const responseMessage = response.data;
        // parse the response for the group id
        const destinationId = responseMessage.data.id;
        objectIds.destination = destinationId;

        // write the destination id to a json file for later deletion
        writeObjectToFile(filePath, objectIds);
        successMessage(`Destination ${destinationId} created`);
    } catch (error) {
        errorMessage(error);
    }
  };

  

  const runSetup = async () => {
    try {
        await createGroup('pbf_snowflake_jan10');
        await createDestination();
    } catch (error) {
      errorMessage(error);
    }
  }

  runSetup();


// create account level webhook for sync_end

// create github connector and return connect card URL

// poll for connector status after 5 seconds

// once connector is in auth state, retrieve the schema

// modify the schema to remove everything but a few columns

// unpause the connector

// listen on endpoint for sync_end webhook event

// once you get first sync_end event, pause the connector


