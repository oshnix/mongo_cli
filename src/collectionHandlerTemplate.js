const Util = require('./util');

module.exports = {
    build({mongoose, vorpal}){
        this.buffer = [];
        let schema = new mongoose.Schema(this.schemaObject);
        this.model = mongoose.model(this.collectionName, schema);

        const findFunctions = {
            find: this.find.bind(this),
            get: this.getBuffer.bind(this)
        };

        const updateFunctions = {
            updateBuffer: this.updateBuffer.bind(this),
            saveBuffer: this.saveBuffer.bind(this)
        };

        Util.createFindCommand(vorpal, this.name, findFunctions, this.fields);
        Util.createInsertCommand(vorpal, this.name, this.insert.bind(this), this.fields, this.schemaObject);
        Util.createDeleteCommand(vorpal, this.name, this.delete.bind(this), this.fields);
        Util.createUpdateCommand(vorpal, this.name, updateFunctions, this.fields);
    },
    find(args){
        let searchParams = Object.create(null);
        for (let field in args.options){
            if(this.fields[field] || field === '_id') searchParams[field] = args.options[field];
        }
        const promise = args.options.single ? this.model.findOne(searchParams).cache(30).exec() : this.model.find(searchParams).cache(30).exec();
        promise.then(response => {
            if(args.options.buffer){
                this.buffer = Array.isArray(response) ? response : [response];
            }
        });
        return promise
    },
    getBuffer(){
        return this.buffer;
    },
    insert(args){
        let item = new this.model(args.options);
        return new Promise((resolve, reject) => {
            item.save((err, res) => {
                if(err) reject(err);
                else resolve([res]);
            })
        });
    },
    delete(args){
        let deleteParams = Object.create(null);
        for (let field in args.options){
            if(this.fields[field] || field === '_id') deleteParams[field] = args.options[field];
        }
        return new Promise((resolve, reject) => {
            const callback = (err, res) => {
                if(err) reject(err);
                resolve(res)
            };
            if(args.options.single){
                this.model.findOneAndRemove(deleteParams, callback)
            } else {
                this.model.remove(deleteParams, callback)
            }
        });
    },
    updateBuffer(args){
        for (let i in args.options){
            for(let j of this.buffer){
                j[i] = args.options[i];
            }
        }
        return this.buffer;
    },
    saveBuffer(){
        for(let item of this.buffer){
            item.save();
        }
    }
};