const fs = require('fs');

const writeObjectToFile = (filePath, object) => {
    const data = JSON.stringify(object);
    fs.writeFile(filePath, data, (err) => {
        if (err) throw err;
    });
}

module.exports = writeObjectToFile;