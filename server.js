require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

console.log(rebuildDatabase);

connection.connect((err) => {
  if (err) {
    console.error(`error connecting: ${err.stack}`);
    return;
  }

  connection.query(`DROP TABLE IF EXISTS parks;`, (queryErr, result) => {
    if (queryErr) throw queryErr;
    else console.log(result);

    connection.query(
      `CREATE TABLE parks (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(255), parkcode VARCHAR(10), states VARCHAR(255), designation VARCHAR(255));`,
      (queryErr, result) => {
        if (queryErr) throw queryErr;
        else console.log(result);

        axios.get(`https://developer.nps.gov/api/v1/parks?api_key=${process.env.NATIONAL_PARKS_APIKEY}&limit=468`).then(
          (response) => {
            // const parksData = [];
            const parks = response.data.data;
            let parkValues = '';

            parks.forEach((park, index) => {
              if (index === parks.length - 1) {
                parkValues += `("${park.fullName}", "${park.parkCode}", "${park.states}", "${park.designation}")`;
              } else {
                parkValues += `("${park.fullName}", "${park.parkCode}", "${park.states}", "${park.designation}"), `;
              }
            });

            const queryString = `INSERT INTO parks (fullname, parkcode, states, designation) VALUES ${parkValues}`;

            connection.query(queryString, (queryErr, result) => {
              if (queryErr) throw queryErr;
              else console.log(result);
            });
          },
          (error) => {
            console.log(error);
          },
        );
      },
    );
  });
  console.log(`connected as id ${connection.threadId}`);
});

app.use(routes);

// Start the API server now
app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
