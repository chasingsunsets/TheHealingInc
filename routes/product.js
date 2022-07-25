const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

const Product = require('../models/Product');

const ensureAuthenticated = require('../helpers/auth');

// Required for file upload 
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.get('/listProducts', (req, res) => {
    Product.findAll({
        where:  req.params.id,
    })
        .then((products) => {
            res.render('product/listProducts', { products, layout: 'staffMain' });
        })
        .catch(err => console.log(err));
});

router.get('/productCatalogue', (req, res) => {
    Product.findAll({
        where:  req.params.id,
    })
        .then((products) => {
            res.render('product/catalogue', { products });
        })
        .catch(err => console.log(err));
});

router.get('/addProduct', (req, res) => {
    res.render('product/addProduct', { layout: 'staffMain' });
});

router.post('/addProduct', (req, res) => {
    let name = req.body.name;
    let posterURL = req.body.posterURL;
    let stock = req.body.stock;
    let size = req.body.size;
    let price = req.body.price;
    // Multi-value components return array of strings or undefined
    let category = req.body.category === undefined ? '' : req.body.category.toString();

    Product.create(
        { name, posterURL, stock, size, price, category}
    )
        .then((product) => {
            console.log(product.toJSON());
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err))
});

router.get('/editProduct/:id', (req, res) => {
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

router.post('/editProduct/:id', (req, res) => {
    let name = req.body.name;
    let posterURL = req.body.posterURL;
    let stock = req.body.stock;
    let size = req.body.size;
    let price = req.body.price;
    let category = req.body.category === undefined ? '' : req.body.category.toString();
    Product.update(
        { name, posterURL, stock, size, price, category },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' product updated');
            res.redirect('/product/listProducts');
        })
        .catch(err => console.log(err));
});

router.get('/deleteProduct/:id', async function (req, res) {
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

module.exports = router;