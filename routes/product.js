const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');

router.get('/addProduct', ensureAuthenticated, (req, res) => {
    res.render('product/addProduct');
});

router.get('/listProducts', ensureAuthenticated, (req, res) => {
    Product.findAll({
        where: { userId: req.user.id },
        order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((products) => {
            // pass object to listVideos.handlebar
            res.render('product/listProducts', { products, layout:'account' });
        })
        .catch(err => console.log(err));
});

module.exports = router;