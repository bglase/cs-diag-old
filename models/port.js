/**
 * Model that manages a table of device (serial) port configurations
 * 
 */

// ID of the model as used to access it (eg from controllers). Defaults to filename less extension
exports.id = 'port';

// The name of the database table accessed by this model
exports.table = 'port';

// A version number
exports.version = '1.00';

// Executed when the model is installed
exports.install = function() {
    console.log( exports.id + ' installed.');
};

// Executed when the model is uninstalled
exports.uninstall = function() {
    console.log('This model is uninstalled.');
};

// Creates (adds) a new item to the table
exports.create = function(item) 
{
    DATABASE(exports.table).insert(item);
};

exports.load = function(id, callback) 
{
    DATABASE('exports.table').one(function(doc) 
        {
            return doc.id === id;
        }, callback);
}