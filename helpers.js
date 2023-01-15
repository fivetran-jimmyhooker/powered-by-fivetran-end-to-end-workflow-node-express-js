const os = require('os');
const chalk = require('chalk');
require('pretty-error').start();

// Console.log success message
const successMessage = (message) => {
    console.log(os.EOL);
    console.log(chalk.green(message));
}

// Throw error
const errorMessage = (message) => {
    console.log(os.EOL);
    console.log(chalk.red(message));
    process.exit(1);
}

module.exports = {
    successMessage,
    errorMessage
}
