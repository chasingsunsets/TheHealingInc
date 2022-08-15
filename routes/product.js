const express = require('express');
const router = express.Router();
const handlebars = require('../helpers/handlebars');
const flashMessage = require('../helpers/messenger');

const Product = require('../models/Product');

const ensureAuthenticated = require('../helpers/auth');
const ensureAuthenticatedStaff = require('../helpers/auth2');

Order = require('../models/Order');

// Required for file upload 
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/listProducts', ensureAuthenticatedStaff, (req, res) => {
    Product.findAll()
        .then((product) => {
            res.render('product/listProducts', { product, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.get('/catalogue', (req, res) => {
    Product.findAll()
        .then((product) => {
            res.render('product/catalogue', { product });
        })
        .catch(err => console.log(err));
});

router.get('/addProduct', ensureAuthenticatedStaff, (req, res) => {
    res.render('product/addProduct', { layout: 'staffMain' });
});

router.post('/addProduct', ensureAuthenticatedStaff, (req, res) => {
    let name = req.body.name;
    let posterURL = req.body.posterURL;
    let stock = req.body.stock;
    let weight = req.body.weight;
    let price = req.body.price;
    // Multi-value components return array of strings or undefined
    let category = req.body.category === undefined ? '' : req.body.category.toString();

    Product.create(
        { name, posterURL, stock, weight, price, category}
    )
        .then((product) => {
            console.log(product.toJSON());
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err))
});

router.get('/editProduct/:id', ensureAuthenticatedStaff, (req, res) => {
    Product.findByPk(req.params.id)
        .then((product) => {
            if (!product) {
                flashMessage(res, 'error', 'Product not found');
                res.redirect('/product/listProducts');
                return;
            }

            res.render('product/editProduct', { product, layout: 'staffMain'});
        })
        .catch(err => console.log(err));
});

router.post('/editProduct/:id', ensureAuthenticatedStaff, (req, res) => {
    let name = req.body.name;
    let posterURL = req.body.posterURL;
    let stock = req.body.stock;
    let weight = req.body.weight;
    let price = req.body.price;
    let category = req.body.category === undefined ? '' : req.body.category.toString();
    Product.update(
        { name, posterURL, stock, weight, price, category },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' product updated');
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err));
});

router.get('/deleteProduct/:id', ensureAuthenticatedStaff, async function (req, res) {
    try {
        let product = await Product.findByPk(req.params.id);
        if (!product) {
            flashMessage(res, 'error', 'Product not found');
            res.redirect('/product/listProducts');
            return;
        }
        let result = await Product.destroy({ where: { id: product.id } });
        console.log(result + ' product deleted');
        flashMessage(res, 'success', 'Product successfully deleted');
        res.redirect('/product/listProducts');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/upload', (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' )) {
        fs.mkdirSync('./public/uploads/' , { recursive: true });
    }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ err: err });
        }
        else if (req.file == undefined) {
            res.json({});
        }
        else {
            console.log(req.file.filename);
            res.json({ file: `/uploads/${req.file.filename}` });
        }
    });
});

router.get('/itemDesc/:id', (req, res) => {
    Product.findByPk(req.params.id)
        .then((product) => {
            if (!product) {
                flashMessage(res, 'error', 'Product not found');
                res.redirect('/product/catalogue');
                return;
            }
            res.render('product/itemDesc', { product });
        })
        .catch(err => console.log(err));
});

router.post('/itemDesc/:id', async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    let name = product.name;
    let price = product.price;
    let userId = req.user.id;
    let totalprice = product.price;
    let weight = product.weight;
    let amount = 1;
    flashMessage(res, 'success', 'Product has added in shopping cart');
    Order.CartItem.create(
		{ userId, product:name, amount, price, totalprice, weight, m_weight: weight },
	)
		.then((order) => {
			console.log(order.toJSON());
			res.redirect('/product/itemDesc/' + req.params.id);
		})
		.catch(err => console.log(err));

});

module.exports = router;