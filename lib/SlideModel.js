var when = require('when');

module.exports = SlideModel;

function SlideModel(slides) {
	this.slides = slides;
}

/**
 * Returns a promise for the content of a particular slide by number
 * @param {number} slide slide number (zero-based) to get
 * @returns {Promise} promise for the slide content
 */
SlideModel.prototype.get = function(slide) {
	return when(this.slides).then(function(slides) {
		return getSlide(slide, slides);
	});
};

function getSlide(slide, slides) {
	return 0 <= slide && slide < slides.length
		? when(slides[slide]).then(function(content) {
			return { slide: slide, content: content };
		})
		: when.reject(new Error('No such slide: ' + slide));
}
