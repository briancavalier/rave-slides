var marked = require('marked');

module.exports = function (options) {
	return function(markdownText) {
		marked.setOptions(options);
		return marked(markdownText);
	};
};
