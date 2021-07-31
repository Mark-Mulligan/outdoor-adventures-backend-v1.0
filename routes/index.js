const router = require('express').Router();

router.use('/api', require('./api'));
router.use('/api/parks', require('./parks'));

module.exports = router;
