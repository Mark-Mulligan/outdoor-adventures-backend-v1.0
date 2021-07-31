const axios = require('axios');
const connection = require('./connection');

const setupDB = async () => {
  try {
    await connection.connect();
    await connection.execute(`Drop Table IF EXISTS parks;`);
    await connection.execute(
      `CREATE TABLE parks (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(255), parkcode VARCHAR(10), states VARCHAR(255), designation VARCHAR(255));`,
    );

    const response = await axios.get(
      `https://developer.nps.gov/api/v1/parks?api_key=${process.env.NATIONAL_PARKS_APIKEY}&limit=468`,
    );
    await connection.execute(generateSQLForParks(response.data.data));
    connection.end();
    console.log('Parks loaded into database');
  } catch (error) {
    console.log(error);
  }
};

const generateSQLForParks = (parkData) => {
  sqlStatement = `INSERT INTO parks (fullname, parkcode, states, designation) VALUES `;
  parkData.forEach((park, index) => {
    sqlStatement += `("${park.fullName}", "${park.parkCode}", "${park.states}", "${park.designation}")`;
    sqlStatement += index === parkData.length - 1 ? ';' : ', ';
  });

  return sqlStatement;
};

module.exports = setupDB;
