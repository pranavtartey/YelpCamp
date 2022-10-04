const express = require("express");
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campgrounds')
const Review = require('../models/review');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');

const router = express.Router();

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));

router.get('/new',isLoggedIn,campgrounds.renderNewForm);


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit',isLoggedIn, isAuthor,catchAsync(campgrounds.renderEditForm))


module.exports = router;