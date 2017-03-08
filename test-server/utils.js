var Crypto = require('crypto');

exports.md5 = function (data) {
    return Crypto
        .createHash('md5')
        .update(data)
        .digest("hex");
};

