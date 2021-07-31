require('dotenv').config();
const express = require('express');
const cors = require('cors');

const setupDB = require('./config/seed');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static('.'));

// Define middleware here
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
app.use(cors());

setupDB();
app.use(routes);

// Start the API server now
app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
