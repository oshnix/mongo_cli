const prettyjson = require('prettyjson');
const colors = require('colors');

const Util = {
    ObjectIdRegExp: new RegExp("^[0-9a-fA-F]{24}$"),
    isCreatedFromNull(object){
        return typeof object === 'object' && object != null && !Object.isPrototypeOf(object);
    },
    itemPreOutput(item){
        let retVal = Object.assign(Object.create(null), item['_doc']);
        delete retVal['__v'];
        retVal['_id'] = retVal['_id'].toString();
        return retVal;
    },
    logResult(response){
        if(Array.isArray(response)) {
            response = response.map(Util.itemPreOutput);
        } else if(response) {
            response = Util.itemPreOutput(response);
        }
        console.log(prettyjson.render(response));
    },
    idCreator(name){
        let id = Object.create(null);
        id.commandString = '-i, --_id <id>';
        id.description = `Id of object ${name}`;
        id.type = 'string';
        id.converter = id => {
            let retVal = id.toString();
            if(Util.ObjectIdRegExp.test(id)) return retVal;
            throw new Error('Not a valid ObjectId');
        };
        return id
    },
    booleanOptionCreator(commandString, description){
        let option = Object.create(null);
        option.commandString = commandString;
        option.description = description;
        option.type = 'boolean';
        return option;
    },
    createFindCommand(vorpal, name, functions, fields){
        let ownFields = Object.create(null);
        for (let key in fields){
            ownFields[key] = Object.assign(Object.create(null), fields[key]);
        }
        ownFields.buffer =  Util.booleanOptionCreator('-b, --buffer', 'Save result to buffer for changing');
        ownFields.single = Util.booleanOptionCreator('-s, --single', 'select only first object');
        ownFields['_id'] = Util.idCreator();
        Util.createCommonCommand(vorpal,
            {commandName: `${name} find`, commandDescription: `find objects from ${name}`},
            (args, callback) => {
                functions.find(args)
                    .then(response => {
                        Util.logResult(response);
                        callback();
                    })
                    .catch(error => {
                        console.error(error);
                        callback();
                    })
            },
            ownFields);
        vorpal
            .command(`${name} buffer print`, `print buffered elements`)
            .action((args, callback) => {
                Util.logResult(functions.get());
                callback();
            })
    },
    createCommonCommand(vorpal, stringData, action, options, validator){
        if(!this.isCreatedFromNull(options)){
            throw new Error('Object is not null-prototyped');
        }
        let temp = vorpal.command(stringData.commandName, stringData.commandDescription);
        for (let i in options) {
            let option = options[i];
            temp = temp.option(option.commandString.format({name: i}), option.description,
                (option.set !== undefined && Array.prototype.isPrototypeOf(option.set) ? option.set : undefined));
        }
        temp
            .validate(args => {
                for(let i in options){
                    let option = options[i];
                    if(args.options[i] === undefined){
                        if(option.required === true){
                            return colors.red(`Option ${i} is not present`);
                        } else {
                            continue;
                        }
                    }
                    if(option.converter){
                        try{
                            args.options[i] = option.converter(args.options[i]);
                        } catch(error){
                            return `Convertion to required type ${option.type} failed`;
                        }
                    }
                    if(typeof args.options[i] !== option.type){
                        return colors.red(`Option ${i} has wrong type ${typeof args.options[i]} (${option.type} expected)`)
                    }
                    else if(option.set !== undefined && option.set.indexOf(args.options[i]) < 0){
                        console.log(args.options[i]);
                        return colors.red(`Option ${i} can be only one of values from\n${prettyjson.render(option.set)}`)
                    }
                }
                if(validator){
                    return validator(args.options)
                }
            })
            .action((args, callback) => {
                action(args, callback)
            })
    },
    createInsertCommand(vorpal, name, promise, fields, schemaObject){
        let ownFields = Object.create(null);
        for (let key in fields){
            ownFields[key] = Object.assign(Object.create(null), fields[key]);
            ownFields[key].required = schemaObject[key].required;
        }
        Util.createCommonCommand(vorpal,
            {commandName: `${name} insert`, commandDescription: `insert object into ${name}`},
            (args, callback) => {
                promise(args)
                    .then(response => {
                        Util.logResult(response);
                        callback();
                    })
                    .catch(error => {
                        console.error(error);
                        callback();
                    })
            },
            ownFields);
    },
    createDeleteCommand(vorpal, name, promise, fields){
        let ownFields = Object.create(null);
        for (let key in fields){
            ownFields[key] = Object.assign(Object.create(null), fields[key]);
        }
        ownFields['_id'] = Util.idCreator(name);
        ownFields.single = Util.booleanOptionCreator('-s, --single', 'delete only first object');
        Util.createCommonCommand(vorpal,
            {commandName: `${name} delete`, commandDescription: `delete objects from ${name}`},
            (args, callback) => {
                promise(args)
                    .then(response => {
                        if(response.result){
                            console.log(colors.green(`\tElements deleted count: ${response.result.n}`));
                        } else {
                            console.log(colors.green(`\tDeleted element:`));
                            Util.logResult([response]);
                        }
                        callback();
                    })
                    .catch(error => {
                        console.error(error);
                        callback();
                    })
            },
            ownFields);
    },
    createUpdateCommand(vorpal, name, functions, fields){
        let ownFields = Object.create(null);
        for (let key in fields){
            ownFields[key] = Object.assign(Object.create(null), fields[key]);
        }
        Util.createCommonCommand(vorpal,
            {commandName: `${name} buffer update`, commandDescription: `update buffer associated with ${name}`},
            (args, callback) => {
                try {
                    const result = functions.updateBuffer(args);
                    Util.logResult(result);
                    callback();
                } catch(err){
                    console.error(err);
                    callback();
                }
            },
            ownFields);
        vorpal
            .command(`${name} buffer save`, 'save buffer into database')
            .action((args, callback) => {
                try {
                    functions.saveBuffer();
                } catch(err) {
                    console.error(err);
                }
                callback();
            })
    }
};

module.exports = Util;