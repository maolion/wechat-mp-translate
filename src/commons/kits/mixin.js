import { isFunction, isPlainObject, toPlainObject } from './util';

export default function mixin() {
    let targets = Array.prototype.slice.call(arguments)
        .map(target => toPlainObject(target));

    let propMapping = {};
    let obj = {};

    return function(Source) {
        return function() {
            let source = new Source();

            for (let target of targets) {
                for (let propKey of Object.keys(target)) {
                    if (!propMapping[propKey]) {
                        propMapping[propKey] = [];
                    }

                    propMapping[propKey].push(target[propKey]);
                }
            }

            for (let propKey of Object.keys(propMapping)) {
                let values = propMapping[propKey];

                if (source[propKey]) {
                    values.push(source[propKey]);
                }

                if (values.length > 1) {
                    source[propKey] = mixinValue(values);
                } else {
                    source[propKey] = values[0];
                }
            }

            return source;
        }
    }
}

function mixinValue(values) {
    let lastValue = values[values.length - 1];
    if (isPlainObject(lastValue)) {
        return mixinPlainObject(values);
    } else if (isFunction(lastValue)) {
        return mixinFunctions(values);
    } else {
        return lastValue;
    }

}

function mixinFunctions(funcs) {
    let filteredFuncs = funcs.filter(isFunction);

    return function() {
        let ret;
        for (let func of filteredFuncs) {
            ret = func.apply(this, arguments);
        }

        return ret;
    }
}

function mixinPlainObject(objs) {
    let filteredObjs = objs
        .filter(isPlainObject)
        .map(target => toPlainObject(target));

    return Object.assign.apply(Object, [{}, ...filteredObjs]);
}
