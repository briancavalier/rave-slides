var csst = require('csst');
var when = require('when');

// OOCSS States for slides and slide container
var slideBeforeState = 'slide slide-before'
var slideAfterState = 'slide slide-after';
var slideCurrentState = 'slide slide-current';
var slideContainerIdentity = 'slide-view-module';
//var slideContainerLoadingState = slideContainerIdentity + ' slide-view-loading';
//var slideContainerTransitioningState = slideContainerIdentity + ' slide-transitioning';

module.exports = SlideView;

function SlideView(slideContainer, slideModel) {
	this.slideModel = slideModel;
	this.current = 0;
	this.slides = [];

	this.container = document.createElement('div');
	slideContainer.appendChild(this.container);
}

SlideView.prototype.next = function() {
	return this.go(this.current + 1);
};

SlideView.prototype.prev = function() {
	return this.go(this.current - 1);
};

SlideView.prototype.reset = function() {
	return this.go(0);
};

SlideView.prototype.go = function(slide) {
	var p = this.slideModel.get(slide);

	if(slide === this.current) {
		return p;
	}

	return p.with(this).tap(function(s) {
		return !this.slides[slide]
			? this._addSlide(slide, s.content)
			: this._transitionToSlide(slide);
	}).with();
};

SlideView.prototype._addSlide = function(slide, slideContent) {
	var holder = document.createElement('div');
	holder.className = (slide < this.current) ? slideBeforeState : slideAfterState;
	holder.id = slide;
	holder.innerHTML = slideContent;

	if(slide < this.current) {
		this.slides[slide] = this.container.insertBefore(holder,
			this.slides[this.current]);
	} else {
		this.slides[slide] = this.container.appendChild(holder);
	}

	return when(slide).with(this).then(this._transitionToSlide);
};

SlideView.prototype._transitionToSlide = function(slide) {
	var prev = this.current;
	var dx = slide - prev;
	this.current = slide;

	var range = {};
	range[slideBeforeState] = 0;
	range[slideCurrentState] = slide;
	range[slideAfterState] = slide+1;

	var setState = csst.lift(csst.range(range));

	if(dx < 0) {
		setSlidesState(setState, slide, prev, this.slides);
	} else if(dx > 0) {
		setSlidesState(setState, prev, slide, this.slides);
	}
};

function setSlidesState(setState, start, end, slides) {
	end = Math.min(end, slides.length);
	return slides.slice(start, end + 1).map(function(slide, i) {
		return setState(start + i, slide);
	});
}