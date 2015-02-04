/**
 * Controller to manage the configuration of device (serial) ports
 * 
 */

/**
 * Installs the controller (executed at application start)
 * 
 */
exports.install = function(framework) 
{
    framework.route('/ports', listPorts)
    framework.route('/ports', addPort, ['post'])
    framework.route('/ports/{id}', updatePort, ['put'])
    framework.route('/ports/{id}', deletePort, ['delete'])
};

/**
 * Returns a list of all ports
 * 
 */
function listPorts()
{
}

function addPort()
{
}

function updatePort(id)
{
}

function deletePort(id)
{
}


function json_create_user() {
    var port = { id: 'COM1', alias: 'First Port' };

    // global alias:
    MODEL('port').create(port);

    this.json(port);
}
