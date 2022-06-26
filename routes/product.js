const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');

router.get('/listProducts', ensureAuthenticated, (req, res) => {
    Product.findAll({
        where: { productId: req.product.id },
        order: [['dateRelease', 'DESC']],
        raw: true
    })
        .then((products) => {
            res.render('product/listProducts', { products });
        })
        .catch(err => console.log(err));
});

router.get('/addProduct', ensureAuthenticated, (req, res) => {
    res.render('product/addProduct');
});

router.post('/addProduct', ensureAuthenticated, (req, res) => {
    let name = req.body.name;
    let stock = req.body.stock;
    let size = req.body.size;
    let price = req.body.price;
    // Multi-value components return array of strings or undefined
    let category = req.body.category === undefined ? '' : req.body.category.toString();
    let productId = req.product.id;

    Product.create(
        { name, stock, size, price, category, productId }
    )
        .then((product) => {
            console.log(product.toJSON());
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err))
});

router.get('/editProduct/:id', ensureAuthenticated, (req, res) => {
    Product.findByPk(req.params.id)
        .then((product) => {
            if (!product) {
                flashMessage(res, 'error', 'Product not found');
                res.redirect('/product/listProducts');
                return;
            }

            res.render('product/editProduct', { product });
        })
        .catch(err => console.log(err));
});

router.post('/editProduct/:id', ensureAuthenticated, (req, res) => {
    let name = req.body.name;
    let stock = req.body.stock;
    let size = req.body.size;
    let price = req.body.price;
    let category = req.body.category === undefined ? '' : req.body.category.toString();
    Product.update(
        { name, stock, size, price, category },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' product updated');
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err));
});

router.get('/deleteProduct/:id', ensureAuthenticated, async function (req, res) {
    try {
        let product = await Product.findByPk(req.params.id);
        if (!product) {
            flashMessage(res, 'error', 'Product not found');
            res.redirect('/product/listProducts');
            return;
        }
        let result = await Product.destroy({ where: { id: product.id } });
        console.log(result + ' product deleted');
        res.redirect('/product/listProducts');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;