# Powered by Fivetran End-to-End Workflow in Node/Expres
End-to-end example of how to build and orchestrate on top of Powered by Fivetran in Express/Node

## Workflow Steps:
- Create Group
- Create Destination
- Create Webhook
- Create Connector and Connect Card
- Poll for Connector Status
- Retrieve Schema (in progress)
- Modify Schema (in progress)
- Unpause Connector (in progress)
- Pause on sync_end webhook receipt (in progress)

## Setup
- Make sure you have node/npm installed: https://nodejs.org/en/
- Clone the repo or download the full zip
- Run `npm install' from inside the root of the project to install all packages

## Env Variables
Create a .env file in the root and fill out the following variables
```
API_KEY=
API_SECRET=
SIGNATURE_SECRET=
WEBHOOK_URL=
DESTINATION_HOST=
DESTINATION_DATABASE=
DESTINATION_AUTH=
DESTINATION_USER=
DESTINATION_PASSWORD=
```

## Setup and run a local webhooks instance
I'll be improving this and making it part of this project, but for now, go [to this repo](https://github.com/fivetran-jimmyhooker/fivetran-webhook-example-express-js) and follow the instructions to get it running. This project won't run without a valid webhooks endpoint (and you'll need to fill in the NGROK url above).

## Run the project
- Run `node setup.js` to set things up
- Run `node delete.js` to tear things down

