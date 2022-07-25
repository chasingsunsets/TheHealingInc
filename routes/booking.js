const express = require('express');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../helpers/messenger');
const Booking = require('../models/Booking');
const ensureAuthenticated = require('../helpers/auth');

router.get('/listBookings', (req, res) => {
    Booking.findAll({
        where:  req.params.id,
        order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((bookings) => {
            res.render('booking/listBookings', { bookings, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.get('/addBooking', (req, res) => {
    res.render('booking/addBooking');
});

router.post('/addBooking', (req, res) => {
    let name = req.body.name;
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let email = req.body.email;
    let contactno = req.body.contactno;
    let service = req.body.service;

    Booking.create(
        { name, dateRelease, email, contactno, service }
    )
        .then((booking) => {
            console.log(booking.toJSON());
            res.redirect('/');
        })
        .catch(err => console.log(err))
});

router.get('/editBooking/:id', (req, res) => {
    Booking.findByPk(req.params.id)
        .then((booking) => {
            if (!booking) {
                flashMessage(res, 'error', 'Booking not found');
                res.redirect('/booking/listBookings');
                return;
            }

            res.render('booking/editBooking', { booking, layout: 'staffMain'});
        })
        .catch(err => console.log(err));
});

router.post('/editBooking/:id', (req, res) => {
    let name = req.body.name;
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let email = req.body.email;
    let contactno = req.body.contactno;
    let service = req.body.service;

    Booking.update(
        { name, dateRelease, email, contactno, service },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' booking updated');
            res.redirect('/booking/listBookings');
        })
        .catch(err => console.log(err));
});

router.get('/deleteBooking/:id', async function (req, res) {
    try {
        let booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            flashMessage(res, 'error', 'Booking not found');
            res.redirect('/booking/listBookings');
            return;
        }
        let result = await Booking.destroy({ where: { id: booking.id } });
        console.log(result + ' booking deleted');
        res.redirect('/booking/listBookings');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;