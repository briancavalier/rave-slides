var fluent = require('wire/config/fluent');
var merge = require('wire/config/merge');
var dom = require('wire/dom');

var SlideModel = require('./lib/SlideModel');
var SlideView = require('./lib/SlideView');
var PresentationController = require('./lib/PresentationController');
var split = require('./lib/slides/split');
var markdown = require('./lib/slides/markdown');

module.exports = merge([dom, fluent(function(context) {
	return context
		.add('slides', function() {
			return require.async('./slides.md')
				.then(markdown())
				.then(split(/\s*\<hr\s*\/?\>\s*/i));
		})
		.add('slidesNode', ['qs'], function(qs) {
			return qs('body');
		})
		.add('model', ['slides'], SlideModel)
		.add('view', ['slidesNode', 'model'], SlideView)
		.add('controller', ['view'], PresentationController)
		.add('@startup', ['controller'], function(controller) {
			return controller.start();
		});
})]);