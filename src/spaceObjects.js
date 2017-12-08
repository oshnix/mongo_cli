const template = require('./collectionHandlerTemplate');

let spaceObjects = Object.create(template);
spaceObjects.name = 'object';
spaceObjects.collectionName = 'spaceObjects';

spaceObjects.schemaObject = {
    ObjectName: {
        type: String,
        required: true
    },
    ObjectClass: {
        type: String,
        required: true,
    },
    FoundBy: {
        type: String,
        required: true
    },
    ObjectCoords: {
        type: {
            type: String,
            required: true
        },
        coordinates: [Number],
    }
};

let fields = spaceObjects.fields = Object.create(null);
fields.ObjectName = {
    commandString: '-n, --#{name} <#{name}>',
    description: "Object name",
    type: "string"
};
fields.ObjectClass = {
    commandString: '-c --#{name} <#{name}>',
    description: "Object class",
    set: ["Галактика", "Звезда", "Планета", "Спутник", "Астероид"],
    type: "string"
};
fields.FoundBy = {
    commandString: '-f --#{name} <#{name}>',
    description: "Scientist who found object",
    type: "string"
};
fields.ObjectCoords = {
    commandString: '--#{name} <#{name}>',
    description: 'Coordinates in format: (%x;%y)',
    converter: value => {
        if(typeof value != 'string') throw new Error('wrong string format');
        value = value.match(/[+-]?([0-9]*[.])?[0-9]+/g);
        if(value.length != 2) throw new Error('wrong input');
        return {
            type: "Point",
            coordinates: [+value[0], +value[1]]
        };
    },
    type: "object"
};

module.exports = spaceObjects.build.bind(spaceObjects);