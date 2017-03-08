var storage = {};


exports.get = function(key) {
    return new Promise((resolve, reject) => {
        resolve(storage[key]);
    });
};

exports.set = function(key, value) {
    return new Promise((resolve, reject) => {
        storage[key] = value;
        resolve();
    });
}
