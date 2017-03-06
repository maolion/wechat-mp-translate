
export function toPlainObject(target, dest) {
    dest = dest || {};

    if (isFunction(target)) {
        target = new target();
    }

    if (!isPlainObject(target)) {
        return dest;
    }

    if (target.constructor !== Object && target != target.constructor.prototype) {
        toPlainObject(target.constructor.prototype, dest);
    }

    for (let propKey in target) {
        dest[propKey] = target[propKey];
    }

    return dest;
}

export function isPlainObject(obj) {
    return Object.prototype.toString.call(obj).toLowerCase() === '[object object]';
}

export function isFunction(obj) {
    return Object.prototype.toString.call(obj).toLowerCase() === '[object function]';
}
