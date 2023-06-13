const getAll = require('./contacts');
const getById = require('./contacts');
const add = require('./contacts');
const updateById = require('./contacts');
const updateStatusContact = require('./contacts');
const remove = require('./contacts');

module.exports = {
    getAll,
    getById,
    add,
    updateById,
    updateStatusContact,
    remove
}