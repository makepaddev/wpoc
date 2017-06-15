/**
 *
 */
class Base {
    constructor() {
        let proto = Object.getPrototypeOf(this);
        if (!Base.protoReady.has(proto)) {
            Base.initPrototype(proto);
        }
    }

    static initPrototype(proto) {
        if (!Base.protoReady.has(proto)) {
            const stack = [];

            // run prototype functions
            while(proto){
                if (Base.protoReady.has(proto)) {
                    break;
                }

                stack.push(proto);
                Base.protoReady.add(proto);
                proto = Object.getPrototypeOf(proto);
            }

            for(let i = stack.length - 1; i >= 0; i--) {
                let proto = stack[i];

                // Initialize properties.
                if (proto.hasOwnProperty('properties')) {
                    proto.properties();
                }
                for(var key in proto.__inheritables__){
                    if(proto.hasOwnProperty(key)){
                        var cb = proto.__inheritables__[key]
                        cb.call(proto)
                    }
                }
            }

        }
    }

    inheritable(key, cb){
        if(!this.hasOwnProperty('__inheritables__')) {
            this.__inheritables__ = Object.create(this.__inheritables__ || null);
        }
        this.__inheritables__[key] = cb
    }

    constructAnnotations(annotations){
    }

    properties() {
        this.inheritable(`annotations`, function(){
            this.__annotations__ == Object.create(this.__annotations__ || null, this.annotations);
            this.constructAnnotations(this.annotations);
        })
    }

    static extend(properties) {
        class extended extends this {
        }
        for (let key in properties) {
            let desc = Object.getOwnPropertyDescriptor(properties, key);
            Object.defineProperty(extended, key, desc);
        }
        return extended;
    }

}

Base.protoReady = new WeakSet();

module.exports = Base;