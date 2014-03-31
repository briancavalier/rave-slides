var csst = require('csst');

var doc = window.document;
var html = doc.getElementsByTagName('html')[0];
var body = window.document.body;
var supportsTouch = 'ontouchstart' in body;
var addTouchClass = csst.lift(csst.map({ touch: true, 'no-touch': false }));

module.exports = PresentationController;

function PresentationController(slideView) {
	addTouchClass(supportsTouch, html);
	this._slideView = slideView;
}

PresentationController.prototype.start = function() {
	// Goto first slide
	var slideView = this._slideView;
	if('onhashchange' in window) {
		window.onhashchange = function() {
			slideView.go(getHash());
		};
	}

	window.onkeyup = function(e) {
		var key, ret;

		key = (window.event) ? event.keyCode : e.keyCode;
		ret = true;

		// Don't handle slide changes when modifiers are down. Only
		// plain arrow keys change slides.
		if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return true;

		switch(key) {
			case 37: // Left arrow
				// case 38: // Up arrow, used for keyboard scrolling
				slideView.prev().then(success);
				stopEvent(e);
				ret = false;
				break;
			case 39: // Right arrow
				// case 40: // Down arrow, used for keyboard scrolling
				slideView.next().then(success);
				stopEvent(e);
				ret = false;
				break;
		}

		return ret;
	};

	if(supportsTouch) {
		initTouchEvents(slideView);
	}

	return slideView.go(getHash()).then(function(result) {
		success(result);
	});

};

/*
 Function: setHash
 Sets the location hash to the supplied slide number.  This will
 clobber any existing hash.

 Parameters:
 slide - The slide number to which to set the hash
 */
function setHash(slide) {
	window.location.hash = '#' + slide;
}

/*
 Function: getHash

 Returns:
 the current location hash without the leading '#'
 */
function getHash() {
	var h = window.location.hash;
	return h.length > 1 && h[0] === '#' ? (Math.max(0, 1*h.substring(1))) : 0;
}

/*
 Function: success
 Callback to be invoked on successful <SlideView> transtions, currently just
 updates the location hash by calling <setHash>

 Parameters:
 result - result provided by <SlideView>
 */
function success(result) {
	setHash(result.slide);
}

/*
 Function: stopEvent
 Prevents the default action and stops propagation of the supplied DOM event.

 Parameters:
 e - the event to stop
 */
function stopEvent(e) {
	e.preventDefault();
	e.stopPropagation();
}

/*
 Function: initTouchEvents
 Sets up touch events for navigating slides

 Parameters:
 slideView - the <SlideView> on which to handle touch events
 */
function initTouchEvents(slideView) {
	// TODO: Should use the slide view's container, not body.
	body.ontouchstart = function(e) {
		var x = e.targetTouches[0].pageX,
			y = e.targetTouches[0].pageY,
			moved = false;

		body.ontouchmove = function(e) {
			moved = true;
		};

		body.ontouchend = function(e) {
			var ret = true;
			try {
				if(e.changedTouches.length === 1) {
					var next;

					if(moved) {
						var dx = e.changedTouches[0].pageX - x,
							dy = e.changedTouches[0].pageY - y;

						if(Math.abs(dx) > Math.abs(dy)) {
							stopEvent(e);
							next = dx <= 0;
						}

						ret = false;

					} else {
						// stopEvent(e);
						// next = e.changedTouches[0].pageX > (window.innerWidth/2);
					}

					if(next !== void 0) {
						setTimeout(function() {
							slideView[next ? 'next' : 'prev']().then(success);
						}, 0);
					}

				}

				return ret;

			} finally {
				moved = false;
				body.ontouchend = null;
				body.ontouchmove = null;
			}
		};

		return ret;
	};

}

