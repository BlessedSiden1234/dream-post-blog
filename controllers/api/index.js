const router = require('express').Router();
const loginRoutes = require('./login-routes.js');

router.use('/', loginRoutes);

module.exports = router;