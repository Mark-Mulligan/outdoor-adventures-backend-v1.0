require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connection = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('.'));

// Define middleware here
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
app.use(cors());

connection.connect((err) => {
  if (err) {
    console.error(`error connecting: ${err.stack}`);
    return;
  }

  console.log(`connected as id ${connection.threadId}`);
});

app.use(routes);

// Start the API server now
app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
