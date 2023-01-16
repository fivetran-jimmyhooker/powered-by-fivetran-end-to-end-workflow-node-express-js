# Powered by Fivetran End-to-End Workflow in Node/Express

End-to-end example of how to build and orchestrate on top of [Powered by Fivetran](https://fivetran.com/docs/rest-api) in Express/Node. This entire project is pretty heavily commented and is structured to be relatively easy to read. Please give feedback if it doesn't accomplish its goal!

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

- [Create a Fivetran account](https://fivetran.com/signup) and copy your key and secret that [you can find in settings](https://fivetran.com/account/settings/account). Find out more in our [getting started guide](https://fivetran.com/docs/rest-api/getting-started)
- [Create a trial account on Snowflake](https://signup.snowflake.com/) and set it up for Fivetran with [this guide](https://fivetran.com/docs/destinations/snowflake/setup-guide). You only need to get up to Step 2. Write down all the usernames/passwords/etc. You'll also need the host URL, which you can find in Admin > Accounts, then hover the Account ID and click the link icon. We'll use these to update the Env variables later in this guide.
- We'll need to be able to accept webhooks locally to run this project, so you'll need NGROK. Create an account and install it: https://ngrok.com/download
- Make sure you have [Node](https://nodejs.org/en/) installed (I generally stick to LTS, you'll need >= v16 for this project).

## Setup

- Clone the repo or download the full zip, then open a terminal and `cd` into the project directory
- Run `npm install` from your terminal while inside the root of the project to install all packages
- Open another terminal window and run NGROK with `ngrok http 4242`. This will open a tunnel to your local machine on port 4242, which is what our Webhook server will use. Copy down the secure, https url it gives you. You'll use this to update the `WEBHOOK_URL` env variable in the next step.

## Env Variables

Create a .env file in the root and fill out the following variables. These will be used for various API requests and setup.

- API key and secret you can get from your [Fivetran settings](https://fivetran.com/account/settings/account).
- `WEBHOOK_URL` will be the secure, https url you get when running NGROK in the previous step. The destination variables will be what you used to setup your Snowflake database.
- To get the `DESTINATION_HOST`, go to your Snowflake account, then head to Admin > Accounts. Hover the Account ID and click the link icon to copy the host url.
- `SIGNATURE_SECRET` is any string you want to use to validate the webhook events are coming from Fivetran, you can just use 'poweredbyfivetran' for this tutorial if you'd like.
- For this tutorial, we'll be using [password auth for Snowflake](https://fivetran.com/docs/rest-api/destinations/config#snowflake), so go ahead and set `DESTINATION_AUTH=PASSWORD`.

```
API_KEY=
API_SECRET=
SIGNATURE_SECRET=poweredbyfivetran
WEBHOOK_URL=
DESTINATION_HOST=
DESTINATION_DATABASE=
DESTINATION_AUTH=PASSWORD
DESTINATION_USER=
DESTINATION_PASSWORD=
```

## Run the project

- Run `npm run start` to run through the workflow steps above
- Run `npm run delete` to tear things down (delete the group, destination, connector, and webhook)

## Give feedback!

Reach out to jimmy.hooker@fivetran.com to give feedback on how embarassing his code is! He should be ashamed!

# Get going with Powered by Fivetran

Sign up for a [Fivetran account](https://fivetran.com/signup) and get going today! We have a whole team ready to help you get started building applications on top of Fivetran's data pipelines. Check out the [QuickStart here](https://fivetran.com/docs/rest-api/powered-by-fivetran)!
