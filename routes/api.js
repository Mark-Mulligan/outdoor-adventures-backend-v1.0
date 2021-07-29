const express = require('express');
const { testApiConnection } = require('../controllers/api');

const router = express.Router();

router.route('/testconnection').get(testApiConnection);

module.exports = router;
