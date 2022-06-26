const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const passport = require('passport');

const ensureAuthenticated = require('../helpers/auth');

router.get('/listProducts', (req, res) => {
    Product.findAll({
        where: { productId: req.product.id },
    })
        .then((products) => {
            res.render('product/listProducts', { products, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.get('/addProduct', (req, res) => {
    res.render('product/addProduct', { layout: 'staffMain' });
});

router.post('/addProduct', (req, res) => {
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
            res.redirect('/product/listProducts', { layout: 'staffMain' });
        })
        .catch(err => console.log(err))
});

router.get('/editProduct/:id', (req, res) => {
    Product.findByPk(req.params.id)
        .then((product) => {
            if (!product) {
                flashMessage(res, 'error', 'Product not found');
                res.redirect('/product/listProducts', {layout: 'staffMain'});
                return;
            }

            res.render('product/editProduct', { product, layout: 'staffMain'});
        })
        .catch(err => console.log(err));
});

router.post('/editProduct/:id', (req, res) => {
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
            res.redirect('/product/listProducts', {layout: 'staffMain'});
        })
        .catch(err => console.log(err));
});

router.get('/deleteProduct/:id', async function (req, res) {
    try {
        let product = await Product.findByPk(req.params.id);
        if (!product) {
            flashMessage(res, 'error', 'Product not found');
            res.redirect('/product/listProducts', {layout: 'staffMain'});
            return;
        }
        let result = await Product.destroy({ where: { id: product.id } });
        console.log(result + ' product deleted');
        res.redirect('/product/listProducts', {layout: 'staffMain'});
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;