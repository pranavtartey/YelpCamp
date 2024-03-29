const Campground = require('../models/campgrounds')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary')

module.exports.index = async (req,res) => {
    let queryObj = {...req.query};
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    console.log(JSON.parse(queryStr));
    //SORTING....
    let query = Campground.find(JSON.parse(queryStr));
    if(req.query.sort){
        query = query.sort(req.query.sort)
        console.log(req.query.sort)
    }
    //EXECUTION OF THE QUERY OBJECT
    const campgrounds = await query;
    // console.log(campgrounds)
    for(let campground of campgrounds){
        campground._id = campground._id.toString();
    }
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res,next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url : f.path,filename : f.filename}))
    campground.author = req.user._id;
    campground._id = campground._id.toString();
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await (await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    })).populate('author');
    if(!campground){
        req.flash('error','Can not find that campground');
        return res.redirect('/campgrounds')
    }
    campground._id = campground._id.toString();
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Can not find that campground');
        return res.redirect('/campgrounds')
    }
    campground._id = campground._id.toString();
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async(req,res) => {
    const {id} = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({url : f.path,filename : f.filename}))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images: {filename:{$in : req.body.deleteImages}}}})
        console.log(campground);
    }
    campground._id = campground._id.toString();
    req.flash('success','Successfully Updated The Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.delete = async (req,res)=> {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success' , 'Successfully deleted the campground');
    res.redirect('/campgrounds');
}