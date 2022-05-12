const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	// renders views/index.handlebars, passing title as an object
	res.render('landing', { title: title })
});

router.get('/catalogue', (req, res) => {
	res.render('catalogue');
});

module.exports = router;
