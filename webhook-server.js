const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const chalk = require("chalk");
const crypto = require("crypto");

dotenv.config();
const signatureSecret = process.env.SIGNATURE_SECRET;

const dumpHeaders = (headers) => {
  console.log(chalk.cyan("Headers"));
  console.log(headers);
  console.log(os.EOL);
};

const dumpPayload = (payload) => {
  console.log(chalk.cyan("Payload"));
  console.log(payload);
  console.log(os.EOL);
};

// Do HMAC signature validation if a signature secret is provided
const checkSignature = (request) => {
  const actualSignature = request.header("x-fivetran-signature-256");
  if (actualSignature && signatureSecret) {
    const expectedSignature = crypto
      .createHmac("sha256", signatureSecret)
      .update(request.body)
      .digest("hex");
    if (actualSignature.toUpperCase() === expectedSignature.toUpperCase()) {
      console.log(chalk.green("Signature OK"));
    } else {
      console.log(chalk.red("Signature mismatch"));
    }
  }
};

// Create an express app with a single endpoint at / that logs the headers and payload
const app = express();
app.use(bodyParser.text({ type: "application/json", defaultCharset: "utf-8" }));
app.post("/", (request, response) => {
  dumpHeaders(request.headers);
  dumpPayload(request.body);
  checkSignature(request);
  console.log("==========" + os.EOL);

  response.send();
});

app.listen(4242, () => console.log("Running on port 4242"));
