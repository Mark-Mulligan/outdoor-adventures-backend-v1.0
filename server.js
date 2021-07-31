require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2');
const bluebird = require('bluebird');

const connection = require('./config/connection');
const routes = require('./routes');
const rebuildDatabase = require('./util');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('.'));

// Define middleware here
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
app.use(cors());

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
    if (index === parkData.length - 1) {
      sqlStatement += `("${park.fullName}", "${park.parkCode}", "${park.states}", "${park.designation}")`;
    } else {
      sqlStatement += `("${park.fullName}", "${park.parkCode}", "${park.states}", "${park.designation}"), `;
    }
  });

  return sqlStatement;
};

setupDB();

app.use(routes);

// Start the API server now
app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
