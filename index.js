require('dotenv').config();
const axios = require('axios');
const randomWords = require('random-words');
const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const clc = require('cli-color');
const crypto = require('crypto');

const key = process.env.API_KEY;
const secret = process.env.API_SECRET;