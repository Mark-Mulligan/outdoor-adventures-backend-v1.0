const express = require('express');
const { getParks, getParkInfo } = require('../controllers/parks');

const router = express.Router();

router.route('/').get(getParks);
router.route('/:parkcode').get(getParkInfo);

module.exports = router;
