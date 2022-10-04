const mongoose = require('mongoose');
const Campground = require('../models/campgrounds')
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser : true,
    useUnifiedTopology : true
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('Database Connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i = 0;i< 50 ;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author : '6331a9950b3a39c1bba2bee3',
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            description : `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloribus dicta atque, vero expedita quae placeat deserunt voluptate vitae repellat temporibus!`,
            price,
            geometry : {
              type:"Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
            ]
            },
            images : [
                {
                  url: 'https://res.cloudinary.com/dhlbhqpas/image/upload/v1664481482/uuqpzy5odkepk7qdmfwz.jpg',
                  filename: 'uuqpzy5odkepk7qdmfwz',
                },
                {
                  url: 'https://res.cloudinary.com/dhlbhqpas/image/upload/v1664481482/rh29oaakn4rp3xxjdi8s.jpg',
                  filename: 'rh29oaakn4rp3xxjdi8s',
                },
                {
                  url: 'https://res.cloudinary.com/dhlbhqpas/image/upload/v1664481482/a4w5imrytzmiawjdxnie.jpg',
                  filename: 'a4w5imrytzmiawjdxnie',
                }
              ]
        });
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
});