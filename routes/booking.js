const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Booking = require('../models/Booking');

const ensureAuthenticated = require('../helpers/auth');

router.get('/addBooking', (req, res) => {
    res.render('booking/addBooking');
});
