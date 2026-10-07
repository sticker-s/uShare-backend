const crypto = require('crypto');

const generateRawToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const hashToken = (rawtoken) => {
    return crypto.createHash('sha256').update(rawtoken).digest('hex');
};

module.exports = { generateRawToken, hashToken };