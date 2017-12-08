const mongoose = require("mongoose");
const cachegoose = require('cachegoose');

cachegoose(mongoose, {
    engine: 'redis',
    port: 6379,
    host: 'localhost'
});

const scientistsBuilder = require("./src/scientists");
const spaceObjectsBuilder = require('./src/spaceObjects');
const vorpal = require('vorpal')();
require('string-format-js');

require('dotenv').config();

const user = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const database = process.env.MONGODB;
const host = process.env.MONGOHOST;
const uri = `mongodb://${user}:${password}@${host}/${database}`;

const options = {
    useMongoClient: true,
};

scientistsBuilder({mongoose, vorpal});
spaceObjectsBuilder({mongoose, vorpal});

mongoose.connect(uri, options).then(() => {
	vorpal
		.delimiter("js@mongo $")
		.show();
});


