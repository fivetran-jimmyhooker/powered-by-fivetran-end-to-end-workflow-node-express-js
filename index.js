const fs = require("fs");
const os = require("os");
require("pretty-error").start();
const chalk = require("chalk");
const figlet = require("figlet");
const open = require("open");
const { setTimeout } = require("timers/promises.js");
const axiosWithAuth = require("./axios-with-auth.js");
const writeObjectToFile = require("./write-files.js");
const runPolling = require("./runPolling.js");

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
const filePath = "setup-details.json";
const objectIds = {
  group: "",
  connector: "",
  destination: "",
  webhook: "",
};

// Check if we've run this before and haven't deleted the file or objects
if (fs.existsSync(filePath)) {
  console.log(
    chalk.red(
      `${filePath} already exists, please run the delete script or delete the setup-details.json file`
    )
  );
} else {
  writeObjectToFile(filePath, objectIds);
}

// Endpoints
const base = "https://api.fivetran.com/v1";
const groupsEndpoint = `${base}/groups`;
const connectorsEndpoint = `${base}/connectors`;
const destinationsEndpoint = `${base}/destinations`;
const webhooksEndpoint = `${base}/webhooks/account`;

// Group Object (feel free to rename)
// https://fivetran.com/docs/rest-api/groups
const groupObject = { name: "pbf_snowflake_jan10" };

// Destination Object
// https://fivetran.com/docs/rest-api/destinations
// Follow setup guide for snowflake up to step 2 for an easy example
// https://fivetran.com/docs/destinations/snowflake/setup-guide
const destinationObject = {
  group_id: "",
  service: "snowflake",
  region: "GCP_US_EAST4",
  time_zone_offset: "-5",
  config: {
    host: process.env.DESTINATION_HOST,
    port: 443,
    database: process.env.DESTINATION_DATABASE,
    auth: "PASSWORD",
    user: process.env.DESTINATION_USER,
    password: process.env.DESTINATION_PASSWORD,
  },
};

// Webhook Object
// https://fivetran.com/docs/rest-api/webhooks
// Simple account level webhook to receive all sync_end events
const webhookObject = {
  url: process.env.WEBHOOK_URL,
  events: ["sync_end"],
  active: true,
  secret: process.env.SIGNATURE_SECRET,
};

// Connector Object
// https://fivetran.com/docs/rest-api/connectors
// Create github connector and return connect card URL
// We'll poll after creation to check for when auth is complete
const connectorObject = {
  service: "github",
  paused: true,
  pause_after_trial: true,
  group_id: "",
  config: {
    schema: "tutorial_github",
  },
  connect_card_config: {
    redirect_uri: "https://www.artdiario.com",
  },
};
let connectorId;
let connectCardUrl;

// Retrieve the schema
// https://fivetran.com/docs/rest-api/connectors/connector-management-api-faq/schema-status
const updateSchemaStatusObject = {
  schema_status: "blocked_on_capture",
  paused: false,
};

// Change schema change handling to BLOCK_ALL
// https://fivetran.com/docs/rest-api/connectors/connector-management-api-faq/schema-status
const updateReloadExcludeObject = {
  exclude_mode: "EXCLUDE",
};

// Modify the schema
// https://fivetran.com/docs/rest-api/connectors#modifyaconnectorschemaconfig
const updateSchemaObject = {
  schema_change_handling: "BLOCK_ALL",
  schemas: {
    test_github: {
      name_in_destination: "test_github",
      enabled: true,
      tables: {
        card: {
          name_in_destination: "card",
          enabled: true,
          enabled_patch_settings: {
            allowed: true,
          },
        },
        column: {
          name_in_destination: "column",
          enabled: true,
          enabled_patch_settings: {
            allowed: true,
          },
        },
      },
    },
  },
};

// Set schema status to ready
// https://fivetran.com/docs/rest-api/connectors/connector-management-api-faq/schema-status
const updateSchemaStatusReadyObject = {
  schema_status: "ready",
};

// Function to create against the Fivetran API
const createObject = async (resource, endpoint, operation, requestObject) => {
  let responseMessage;
  try {
    console.log(requestObject);
    const response = await axiosWithAuth(endpoint, operation, requestObject);
    responseMessage = response.data;

    // Parse the response for the id and update our objectIds object
    let objectId;
    if (resource === "webhook") {
      // Webhook responses don't have a data object (right now! being updated!)
      objectId = responseMessage.id;
    } else if (resource === "connector") {
      connectCardUrl = responseMessage.data.connect_card.uri;
      objectId = responseMessage.data.id;

      // Open the connect card url in the browser
      open(connectCardUrl);
    } else {
      objectId = responseMessage.data.id;
    }

    objectIds[resource] = objectId;

    // Write the id to a json file for later deletion
    writeObjectToFile(filePath, objectIds);
    console.log(`${resource} ${objectId} created`);
  } catch (error) {
    if (resource === "webhook") {
      console.log(
        chalk.red(
          `${error}${os.EOL}${responseMessage.data}${os.EOL} Please check your webhook url is live, https, and able to respond with 2xx codes`
        )
      );
    }

    console.log(error);
    process.exit(1);
  }
};

const asciiArt = (text) => {
  figlet.text(
    text,
    {
      font: "Slant",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    },
    (error, data) => {
      if (error) {
        console.log("Something went wrong...");
        console.dir(error);
        return;
      }

      console.log(chalk.blue(data));
    }
  );
};

const runSetup = async () => {
  try {
    // Hell yeah
    console.log(os.EOL);
    asciiArt("Powered by Fivetran");
    console.log(os.EOL);
    await setTimeout(2000);

    // Create Group
    await createObject("group", groupsEndpoint, "post", groupObject);
    // Update our destinationObject and connectorObject's now that we have a group ID
    destinationObject.group_id = objectIds.group;
    connectorObject.group_id = objectIds.group;

    // Create Destination
    await createObject(
      "destination",
      destinationsEndpoint,
      "post",
      destinationObject
    );

    // Create Webhook
    await createObject("webhook", webhooksEndpoint, "post", webhookObject);

    // Create Connector
    await createObject(
      "connector",
      connectorsEndpoint,
      "post",
      connectorObject
    );
    // Update our connectorId variable now that we have it
    connectorId = objectIds.connector;

    // Poll for connector setup_state being connected
    await runPolling(
      connectorsEndpoint,
      connectorId,
      "setup_state",
      "connected"
    );

    // Update connector schema status to blocked on capture
    await axiosWithAuth(
      `${connectorsEndpoint}/${connectorId}`,
      "patch",
      updateSchemaStatusObject
    );

    // Poll for connector schema_status being blocked_on_customer
    await runPolling(
      connectorsEndpoint,
      connectorId,
      "schema_status",
      "blocked_on_customer"
    );

    // Reload schema excluding all tables
    await axiosWithAuth(
      `${connectorsEndpoint}/${connectorId}/schemas/reload`,
      "post",
      updateReloadExcludeObject
    );

    // Modify the schema
    await axiosWithAuth(
      `${connectorsEndpoint}/${connectorId}/schemas`,
      "patch",
      updateSchemaObject
    );

    // Set schema status to ready
    await axiosWithAuth(
      `${connectorsEndpoint}/${connectorId}`,
      "patch",
      updateSchemaStatusReadyObject
    );

    console.log(os.EOL);
    asciiArt("Hell Yeah");
    console.log(os.EOL);
  } catch (error) {
    console.log(chalk.red(error));
  }
};

runSetup();

// Once connector is in auth state, retrieve the schema

// modify the schema to remove everything but a few columns

// unpause the connector

// listen on endpoint for sync_end webhook event

// once you get first sync_end event, pause the connector
