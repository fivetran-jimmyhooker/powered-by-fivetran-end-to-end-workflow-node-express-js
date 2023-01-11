const os = require('os');
const clc = require('cli-color');

// Console.log success message
const successMessage = (message) => {
    console.log(os.EOL);
    console.log(clc.green(message));
    console.log(os.EOL);
}

// Throw error
const errorMessage = (message) => {
    console.log(os.EOL);
    throw new Error(clc.red(message));
}

module.exports = {
    successMessage,
    errorMessage
}
