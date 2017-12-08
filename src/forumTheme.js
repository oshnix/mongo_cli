const template = require('./collectionHandlerTemplate');
const middleware = require('./handlerMiddleware');

let forumTheme = Object.create(template);
forumTheme.name = 'forum theme';
forumTheme.collectionName = 'forum';

forumTheme.schemaObject = {
    Name: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true,
        default: "Theme"
    },
    Tags: {
        type: [String],
    }
};

let fields = forumTheme.fields = Object.create(null);
fields.Name = {
    commandString: '-n, --#{name} <#{name}>',
    description: "Theme name",
    type: "string"
};
fields.Tags = {
    commandString: '-t, --#{name} [#{name}...]',
    description: "Forum theme tags",
    type: "object",
    converter: item => {
        if (typeof item != 'object') item = [item];
        return item
    }
};

let staticFields = Object.create(null);
staticFields.Type = "Theme";

middleware(forumTheme, staticFields);

module.exports = forumTheme.build.bind(forumTheme);
