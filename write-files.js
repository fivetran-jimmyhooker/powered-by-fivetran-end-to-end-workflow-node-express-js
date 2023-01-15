const fs = require("fs");

// Re-usable function to write an object to a file
const writeObjectToFile = (filePath, object) => {
  const data = JSON.stringify(object);
  fs.writeFile(filePath, data, (error) => {
    if (error) {
      throw error;
    }
  });
};

module.exports = writeObjectToFile;
