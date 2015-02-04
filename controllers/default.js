exports.install = function(framework) {
    framework.route('/', view_index);
    // or
    // framework.route('/');
};

function view_index() {
	var self = this;
	self.view('index');
}