const fs = require("fs");
const axiosWithAuth = require("./axios-with-auth");
const chalk = require("chalk");

//
// This script will delete any objects created by the
// setup script and the setup-details.json file
//

// endpoints
const base = "https://api.fivetran.com/v1";
const groups = `${base}/groups`;
const connectors = `${base}/connectors`;
const destinations = `${base}/destinations`;
const webhooks = `${base}/webhooks`;

// Parse a previously created file if it exists and store it as objectIds
const filePath = "setup-details.json";
let objectIds;

// To satisfy my terrible OCD
const toTitleCase = (word) =>
  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath);
    if (data.length === 0) {
      console.log(chalk.red(`${filePath} is empty.`));
    }

    objectIds = JSON.parse(data);
  } catch (error) {
    console.log(error);
  }
} else {
  console.log(`${filePath} does not exist, please run setup first.`);
}

// Re-usable function to delete objects
const deleteObject = async (type, id) => {
  let responseMessage;
  try {
    const response = await axiosWithAuth(`${type}/${id}`, "delete");
    responseMessage = response.data;
    const resourceType = type.split("/").pop();
    const resource = toTitleCase(resourceType);

    // Special case for webhooks
    console.log(
      responseMessage.message ? "" : chalk.green(`${resource} ${id} deleted`)
    );
  } catch (error) {
    console.log(error.response.data);
  }
};

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

    // Delete setup-details.json file
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log(error);
      }

      console.log(chalk.green("File deleted! Ready to run again!"));
    });
  } catch (error) {
    console.log(error);
  }
};

runDelete();
