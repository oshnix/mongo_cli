const template = require('./collectionHandlerTemplate');

let scientists = Object.create(template);
scientists.name = 'scientists';
scientists.collectionName = 'scientists';

scientists.schemaObject = {
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Country: {
        type: String,
        required: true
    },
    BirthDate: {
        type: Date,
        required: true
    }
};

let fields = scientists.fields = Object.create(null);
fields.FirstName = {
    commandString: '-f, --#{name} <#{name}>',
    description: "Scientist first name",
    type: "string"
};
fields.LastName = {
    commandString: '-l, --#{name} <#{name}>',
	description: "Scientist surname(last name)",
	type: "string"
};
fields.Country = {
    commandString: '-c, --#{name} <#{name}>',
	description: "Scientist's country name",
	type: "string"
};
fields.BirthDate = {
    commandString: '-d, --#{name} <#{name}>',
	description: "Date in following format year[-month][-day]...",
	type: 'object',
    converter: value => new Date(value)
};

scientists.build = ({mongoose, vorpal}) => {
    scientists.schema = new mongoose.Schema(scientists.schemaObject);
    scientists.schema.index({FirstName: 1, LastName: 1});
    Object.getPrototypeOf(scientists).build.call(scientists, {mongoose,vorpal})
};

module.exports = scientists.build.bind(scientists);
