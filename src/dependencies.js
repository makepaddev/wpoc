var Utils = require('./Utils')

function dependencies() {
    let deps = this.dependencies;

    function processDep(key, dep){
        if(Utils.isObjectLiteral(dep)){
            if(dep.type){
                if(!this[dep.type]) throw new Error('Type does not exist: ' + dep.type);
                this[key] = this[dep.type].extend(dep);
            }
            else{
                if(!this[key]) throw new Error('Subclass has no baseclass: ' + key);
                this[key] = this[key].extend(dep);
            }
        }
        else{
            this[key] = dep
        }
        Object.defineProperty(this[key], '__outer__', {value:this})
        Object.defineProperty(this[key], '__name__', {value:key})
    }

    for (let key in deps) {
        let dep = deps[key];

        function makeInheritable(key) {
            this.inheritable(key, function () {
                processDep.call(this, key, this[key])
            })
        }

        if(!this.__inheritables__[key]) makeInheritable.call(this, key);

        processDep.call(this, key, dep)
    }
}

module.exports = dependencies