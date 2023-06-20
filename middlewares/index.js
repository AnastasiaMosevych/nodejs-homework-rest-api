const validateBody = require('./validateBody');
const isValidId = require('./isValidId');
const authenticate = require('./authenticate');
const upload = require('./avatarUpload');

module.exports = {
    validateBody,
    isValidId,
    authenticate,
    upload
}