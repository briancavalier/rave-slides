var csst = require('csst');
var when = require('when');

// OOCSS States for slides and slide container
var slideBeforeState = 'slide slide-before'
var slideAfterState = 'slide slide-after';
var slideCurrentState = 'slide slide-current';
var slideContainerIdentity = 'slide-view-module';
var slideContainerLoadingState = slideContainerIdentity + ' slide-view-loading';
//var slideContainerTransitioningState = slideContainerIdentity + ' slide-transitioning';

var setCurrent = csst.lift(csst.toggle(slideCurrentState), true);
var setPrev = csst.map({ 'slide-before': -1, 'slide-after': 1 });

module.exports = SlideView;

function SlideView(slideContainer, slideModel) {
	this.slideModel = slideModel;
	this.current = -1;
	this.slides = [];

	this.container = document.createElement('div');
	this.container.className = slideContainerLoadingState;
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

	// TODO: Use csst
	var range = {};
	range[slideBeforeState] = 0;
	range[slideCurrentState] = slide;
	range[slideAfterState] = slide+1;

	var r = csst.flip(csst.lift(csst.range(range)));

	var slidesToMap;
	if(dx === 1) {
		slidesToMap = this.slides.slice(Math.max(0, prev - 2), slide + 1);
	} else if(dx === -1) {
		slidesToMap = this.slides.slice(Math.max(0, slide - 1), prev + 2);
	} else {
		slidesToMap = this.slides;
	}

	slidesToMap.map(r);
};
