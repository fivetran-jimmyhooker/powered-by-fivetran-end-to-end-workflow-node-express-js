# Powered by Fivetran End-to-End Workflow in Node/Expres

End-to-end example of how to build and orchestrate on top of Powered by Fivetran in Express/Node. This entire project is pretty heavily commented and is structured to be relatively easy to read. Please give feedback if it doesn't accomplish its goal!

## Workflow Steps:
These are the steps this set of scripts will be running through to create a connector and modify its schema so you only land the data you want. 

- Create Group
- Create Destination
- Create Webhook
- Create Github Connector and Connect Card, open Connect Card in Browser
- Poll for Connector `setup_state` becoming `connected`
- Update `schema_status` to `blocked_on_capture` once `setup_state` is `connected`
- Poll for Connector `schema_status` being `blocked_on_customer`
- Reload Schema and exclude everything
- Modify Schema to include a couple tables
- Pause on sync_end webhook receipt (in progress)
- Set `schema_status` to `ready` to start syncing data
- (IN PROGRESS) On first `sync_end` webhook event receipt, pause the connector (and thus, end the tutorial)

## Prepare
- Create a Fivetran account and copy your key and secret that [you can find in settings](https://fivetran.com/account/settings/account). Find out more in our [getting started guide](https://fivetran.com/docs/rest-api/getting-started)
- We'll need to be able to accept webhooks locally to run this project, so you'll need NGROK. Setup an account and install it: https://ngrok.com/download
- Make sure you have [Node](https://nodejs.org/en/) installed (I generally stick to LTS). 

## Setup

- Clone the repo or download the full zip
- Run `npm install' from inside the root of the project to install all packages

## Open a tunnel
Run this from your terminal to open a tunnel to port 4242 on your machine (which is what the webhook server will run on). Copy down the secure, https url it gives you. You'll use it to update the env variable `WEBHOOK_URL` in the next step. 
- `ngrok http 4242`

## Env Variables

Create a .env file in the root and fill out the following variables. `WEBHOOK_URL` will be the secure, https url you get when running NGROK in the previous step. 

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

## Run the project

- Run `npm run start` to run through the workflow steps above
- Run `npm run delete` to tear things down (delete the group, destination, connector, and webhook)

## Give feedback!
Reach out to jimmy.hooker@fivetran.com to give feedback on how embarassing his code is! He should be ashamed!

# Other Sample Code
- [Webhook Sample Code](https://github.com/fivetran-jimmyhooker/fivetran-webhook-example-express-js)