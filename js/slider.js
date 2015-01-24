var imageIndex = -1;
function MozaicSlider( container, nav ) {
	this.container = container;
	this.nav = nav.show();

	this.mozaic = this.container.find('.mozaic');
	this.mozaicSlider = this.container.closest('.mozaicSlider');
	this.mozaicLen = this.mozaic.length;

	this.current = 0;
	this.transition(null, 0);
}

MozaicSlider.prototype.transition = function( coords, duration ) {
	// would prefer using translate but it creates a new stacking context
	this.container.animate({
		'margin-left': (coords || -( this.current * this.mozaicSlider.width() )) + 'px'
	}, duration);
	if (this.container.find('.mozaic').length) {
		var currentGallery = $(this.container.find('.mozaic')[this.current]);
		$('.curGallery').attr('value', currentGallery.data('index'));
		$galleryName.text(currentGallery.data('name'));
		$('.ring-text').show();
		loadMozaic(currentGallery.find('.mozaicFrame').data('src'), currentGallery);
	}
};

MozaicSlider.prototype.setCurrent = function( dir ) {
	var pos = this.current;

	pos += (dir === 'next') ? 1 : -1;
	this.current = ( pos < 0 ) ?this.mozaicLen - 1 : pos % this.mozaicLen;

	return pos;
};


function loadImage(src) {
	return $.Deferred(function (task) {
		var image = new Image();
		image.onload = function () { task.resolve(image); };
		image.onerror = function () { task.reject(); };
		image.src = src;
		if (image.complete) { task.resolve(image); }
	}).promise();
}

function loadMozaic(src, currentGallery) {

	$.when(
		loadImage(src),
		loadImage(src.replace('main', 'thumbs'))
	).then(function () {
		currentGallery.find('.mozaicFrame').attr('src', src);
		$('.ring-text').hide();
		currentGallery.mozaic();
	});
	
}

var container = $('div.mozaicSliderInner');
slider = new MozaicSlider( container, $('#slider-nav') );

slider.nav.find('a').on('click', function() {
	slider.setCurrent( $(this).data('dir') );
	slider.transition();
});

mozaicWidth = $mozaicSlider.width();
smallMozaic = (mozaicWidth <720) ?true : false;