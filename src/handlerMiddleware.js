const template = require('./collectionHandlerTemplate');
const Util = require('./util');

module.exports = (model, fields) => {
    if(template !== Object.getPrototypeOf(model)) throw new Error("Argument is not created from handler template");
    if(!Util.isCreatedFromNull(fields)) throw new Error("Fields argument is not null-prototyped");
    model.build = function(arg){
        Object.getPrototypeOf(model).build.call(model, arg);
        model.fields = Object.assign(Object.create(null), model.fields);
        for(let i in fields){
            model.fields[i] = 1;
        }
    };
    const proto = Object.getPrototypeOf(model);

    model.find = function(args){
        for(let i in fields){
            args.options[i] = fields[i];
        }
        return proto.find.call(model, args)
    };

    model.insert = function(args){
        for(let i in fields){
            args.options[i] = fields[i];
        }
        return proto.insert.call(model, args);
    };

    model.delete = function(args){
        for(let i in fields){
            args.options[i] = fields[i];
        }
        return proto.delete.call(model, args);
    }
};