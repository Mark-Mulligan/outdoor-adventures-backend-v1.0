const express = require('express');
const { testApiConnection, googleMapsKey } = require('../controllers/api');

const router = express.Router();

router.route('/testconnection').get(testApiConnection);
router.route('/googlemaps').get(googleMapsKey);

module.exports = router;
