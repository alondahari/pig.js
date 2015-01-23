(function () {
	'use strict';

	var doc = document.documentElement;
	doc.setAttribute('data-useragent', navigator.userAgent);

	var logoSize = 1,
		$window = $(window);

	/*
	|-------------------------------------------------------------------------
	| =From http://www.learningjquery.com/2007/10/improved-animated-scrolling-script-for-same-page-links/
	|-------------------------------------------------------------------------
	*/
	// gallery edit globals
	var mainImage = [],
		galleryImages = [],
		thumbDimensions = [],
		rowNum = 0;

	var scrollSpeed = 800;
	var eventImageHeight;
	// media query detection
	var $galleryName = $('.gallery-name'),
		modalScreen = $('.screen'),
		spinner = $('.ring1'),
		$photoModal = $('.photo-modal'),
		$mozaicSlider = $('.mozaicSlider'),
		imageIndex = -1,
		testCounter = 0,
		slider, mozaicWidth, smallMozaic, crop, thumbAspect;

	function displayLoadScreen () {
		modalScreen.addClass('cast');
		spinner.addClass('spinner-cast');
	}

	function removeLoadScreen () {
		modalScreen.removeClass('cast');
		spinner.removeClass('spinner-cast');
	}



	/*
	|-------------------------------------------------------------------------
	| =Mozaic
	|-------------------------------------------------------------------------
	*/
	var scale = 1.3;
	$.fn.mozaic = function() {
		return this.each(function() {
			var mozaic = $(this),
				init;
			if (mozaic.hasClass('mozaic-init')) {
				init = false;
			} else {
				init = true;
				mozaic.addClass('mozaic-init');
			}

			function getNumberOfRows (thumbAmount) {
				if (Math.sqrt(thumbAmount) % 1 === 0) { return Math.sqrt(thumbAmount); }
				var result = 0;
				for (var i = 2; i <thumbAmount; i++){
					if (thumbAmount % i === 0) {
						if (thumbAmount / i === result) {
							return result;
						}
						result = i;
					}
				}
			}

			function getThumbDimensions (mainImageWidth, mainImageHeight, numberOfRows, thumbsPerRow) {
				var width = Math.floor(mainImageWidth / thumbsPerRow),
					height = Math.floor(mainImageHeight / numberOfRows);

				return {
					// we floor the result because the different browsers don't handle fractions of pixels perfectly.
					width: width,
					height: height,
					scaleX: Math.floor(width * scale) / width,
					scaleY: Math.floor(height * scale) / height,
					scaleBoxX: Math.floor((width -1) * scale) / width,
					scaleBoxY: Math.floor((height -1) * scale) / height
				};
			}

			// Variables
			var mozaicSlider = mozaic.closest('.mozaicSlider'),
				mozaicSliderInner = mozaic.closest('.mozaicSliderInner'),
				allMozaics = mozaicSliderInner.children('.mozaic'),
				numberOfMozaics = allMozaics.length,

				thumbAmount = mozaic.data('number-of-images'),

				thumbs = {},
				// mozaicItems = $('<div class="mozaicItems"></div>'),
				small = (mozaicSlider.width() < 720) ? true : false,
				numberOfRows = getNumberOfRows(thumbAmount),
				thumbsPerRow = thumbAmount / numberOfRows,

				$frame = mozaic.find('.mozaicFrame'),
				mainImageSrc = $frame.attr('src'),
				thumbSrc = mainImageSrc.replace('main', 'thumbs'),
				aspectRatio = $frame.width() / $frame.height();

			$frame.css({
				position: 'absolute',
				opacity: 1
			});

			if (small) {
				mozaicSlider.css({
					'padding-top': (1 / aspectRatio * 100) + '%',
					height: 0
				});
			} else {
				mozaicSlider.css({
					'padding-top': 0,
					height: mozaicSlider.width() / aspectRatio
				});
			}
			mozaicSliderInner.css('width', (numberOfMozaics * 100) + '%' );
			// set the dimensions on the mozaic object so floated items aren't pushed down if the window is resized.
			allMozaics.css({
				width: (100 / numberOfMozaics) + '%',
				height: '100%'
			});
			if (!small) {
				allMozaics.css('width', Math.ceil(mozaic.width()));
			}

			thumbs = getThumbDimensions(mozaic.width(), mozaic.height(), numberOfRows, thumbsPerRow);


			for (var i = 0; i <thumbAmount; i++) {

				var	thumb = mozaic.find('.mozaicItem')[i];
				thumb = $(thumb);

				if (small) {
					thumb.addClass('small-mozaic');
				} else {
					thumb.removeClass('small-mozaic');
				}

				var box;
				if (init) {
					box = $('<div class="mozaicImageBox"></div>');
				} else {
					box = mozaic.find('.mozaicImageBox')[i];
					box = $(box);
				}

				// set left to the width of all previous thumbs in the row.
				var posInRow = i % thumbsPerRow,
					posInColumn = Math.floor( i / thumbsPerRow),
					// set top to the thumb height times the row it's on.
					width = thumbs.width,
					height = thumbs.height,
					widthDiff = mozaic.width() - (width * thumbsPerRow),
					heightDiff = mozaic.height() - (height * numberOfRows),
					top = height * posInColumn,
					left = width * posInRow,
					scaledWidth = width * thumbs.scaleX,
					scaledHeight = height * thumbs.scaleY;
				
				if (small) {
					width = (100 / thumbsPerRow) + '%';
					height = (100 / numberOfRows) + '%';
					top = (100 / numberOfRows) * posInColumn + '%';
					left = (100 / thumbsPerRow) * posInRow + '%';
					widthDiff = 100 - (thumbs.width * thumbsPerRow);
					heightDiff = 100 - (thumbs.height * numberOfRows);
				}



				box.css({
					top: top,
					left: left,
					width: width,
					height: height,
					backgroundImage: 'url("' + mainImageSrc + '")',
					backgroundSize: (width * thumbsPerRow) + 'px ' + (height * numberOfRows) + 'px',
					backgroundPosition: (-width) * ( posInRow) + 'px ' + (-height) * posInColumn + 'px'
				});
				if (small) {
					box.css({
						backgroundImage: 'none',
					});
				}

				if (!small) {
					thumb.css({
						// start with a bigger thumb and scale it down because of the way webkit renders the scaled images.
						width: scaledWidth,
						height: scaledHeight,
						transform: 'scale(' +1 / thumbs.scaleX + ',' +1 / thumbs.scaleY + ')',
						top: top - (height * (thumbs.scaleY - 1) / 2) + 'px',
						left: left - (width * (thumbs.scaleX - 1) / 2) + 'px',
						backgroundImage: 'url("' + thumbSrc + '")',
						backgroundSize: (scaledWidth * thumbsPerRow) + 'px ' + (scaledHeight * numberOfRows) + 'px',
						backgroundPosition: (-scaledWidth) * ( posInRow) + 'px ' + (-scaledHeight) * posInColumn + 'px'
					});
				} else {
					thumb.css({
						transform: 'none',
						top: top,
						left: left,
						width: width,
						height: height,
						backgroundImage: 'url("' + thumbSrc + '")',
						backgroundSize: (thumbsPerRow * 100) + '%' + (numberOfRows * 100) + '%',
						backgroundPosition: posInRow * (100 / (thumbsPerRow - 1)) + '% ' + posInColumn * (100 / (numberOfRows - 1)) + '%'
					});
				}

				// determine egde thumbs and scale them only inside the frame.
				if (!small) {
					if (left === 0) {
						box.addClass('leftEdge');
						thumb.addClass('leftEdge');
						thumb.css({
							left: 0
						});
					} else if ((i+1) % thumbsPerRow === 0){
						box.addClass('rightEdge');
						thumb.addClass('rightEdge');
						thumb.css({
							left: '-=' + ((width +widthDiff * thumbs.scaleX) * (thumbs.scaleX - 1) / 2) + 'px',
						});
					}

					if (top === 0) {
						box.addClass('topEdge');
						thumb.addClass('topEdge');
						thumb.css({
							top: 0
						});
					} else if((i+1) >thumbsPerRow * (numberOfRows - 1)){
						box.addClass('bottomEdge');
						thumb.addClass('bottomEdge');
						thumb.css({
							top: '-=' + ((height +heightDiff * thumbs.scaleY) * (thumbs.scaleY - 1) / 2),
						});
					}
				} // end of containScaling

				if (!small) {
					if ((i+1) % thumbsPerRow === 0){ // right edge
						box.css('width', '+=' +widthDiff);
						thumb.css('width', '+=' + (widthDiff * thumbs.scaleX));
					}
					if((i+1) >thumbsPerRow * (numberOfRows - 1)){
						box.css('height', '+=' +heightDiff);
						thumb.css('height', '+=' + (heightDiff * thumbs.scaleY));
					}
				}

				if (init) {
					box.appendTo(mozaic);
				}
			} // end of for loop

			$('.mozaicImageBox').on('click', function() {
				var index = $(this).siblings('.mozaicImageBox').andSelf().index(this);
				var src = mainImageSrc.replace('main', 'image' + index);
				$photoModal.attr('src', src);
				displayLoadScreen();
			});
			// }

			if (small) {
				$('.mozaicFrame').hide();
			} else {
				$('.mozaicFrame').show();
			}


		}); // end of .each mozaic
	}; // end of .mozaic()

	// attaching hover events
	$('.mozaicItem').on({
		mouseenter: function() {
			var $this = $(this);
			$this.css('transform', 'scale(1, 1)');

			$this.siblings('.mozaicImageBox').eq($this.index() - 1).css({
				// adding the z-index to the cross-browser scale
				transform: 'scale(' +scale + ', ' + scale + ')',
				'z-index': 1000
			});

		},
		mouseleave: function() {
			var $this = $(this);
			$this.css('transform', 'scale(' + (1 / scale) + ', ' + (1 / scale) + ')' );
			$this.siblings('.mozaicImageBox').eq($this.index() - 1).css({
				transform: 'scale(1, 1)',
				'z-index': 0
			});
		},
		click: function(){
			var $this = $(this);
			var src = $(this).css('background-image').replace('url(', '');
			src = src.replace(')', '');
			src = src.replace('thumbs', 'image' + ($this.index() - 1) );
			$photoModal.attr('src', src);
			displayLoadScreen();
		}
	}); // end of mozaicItem mouse events

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

	// slider
	var container = $('div.mozaicSliderInner');
	slider = new MozaicSlider( container, $('#slider-nav') );

	slider.nav.find('a').on('click', function() {
		slider.setCurrent( $(this).data('dir') );
		slider.transition();
	});

	mozaicWidth = $mozaicSlider.width();
	smallMozaic = (mozaicWidth <720) ?true : false;

	/*
	|-------------------------------------------------------------------------
	| =Modal
	|-------------------------------------------------------------------------
	*/

	$photoModal.load( function(){
		var photoModalWidth = $photoModal.width(),
			photoModalHeight = $photoModal.height();
		$photoModal.css({
			'margin-left': - photoModalWidth /2 - 13,
			'margin-top': - photoModalHeight /2 - 10
		});
		$photoModal.addClass('modal-cast');

		if ( $('#edit-gallery').length >0 ) {
			$('.modal-dismiss').addClass('modal-cast');
			var thumbAspectDims = thumbAspect.split(':');

			if ( (thumbAspectDims[0] / thumbAspectDims[1]) > (photoModalWidth / photoModalHeight) ) {
				crop.setOptions({
					x1: 0,
					y1: (photoModalHeight - ( photoModalWidth / thumbAspectDims[0] * thumbAspectDims[1] )) / 2,
					x2: photoModalWidth,
					y2: photoModalHeight - (( photoModalHeight - ( photoModalWidth / thumbAspectDims[0] * thumbAspectDims[1] )) / 2)
				});
			} else {
				crop.setOptions({
					x1: (photoModalWidth - ( photoModalHeight / thumbAspectDims[1] * thumbAspectDims[0] )) / 2,
					y1: 0,
					x2: photoModalWidth - (( photoModalWidth - ( photoModalHeight / thumbAspectDims[1] * thumbAspectDims[0] )) / 2),
					y2: photoModalHeight
				});
			}
			crop.setOptions({
				aspectRatio: thumbAspect,
				hide:false
			});
		}
	});

	function checkAndDismiss(evt){
		if ( !$(evt.target).hasClass('mozaicItem') && $photoModal.hasClass('modal-cast') && $('#edit-gallery').length === 0 ){
			dismissModal();
		}
	}

	function dismissModal() {
		removeLoadScreen ();
		$photoModal.removeClass('modal-cast');
		$photoModal.attr('src', '');
	}

	function getImageTrueDimensions(src){
		var newImage = new Image();
		newImage.src = src;
		$(newImage).css('display', 'none').appendTo('body');
		var dimensions = {
			width: newImage.width,
			height: newImage.height
		};
		newImage.remove();
		return dimensions;
	}

	$('.modal-dismiss').on('click', function() {
		var $this = $(this),
			trueDims = getImageTrueDimensions($photoModal.attr('src')),
			widthRatio = trueDims.width / $photoModal.width(),
			heightRatio = trueDims.height / $photoModal.height(),
			cropped = crop.getSelection();

		dismissModal();
		$('.modal-dismiss').removeClass('modal-cast');
		crop.cancelSelection();
		rowNum = numberOfRows(galleryImages.length);
		thumbAspect = getThumbAspect();

		if ($this.data('dir') === 'next') {
			// save data


			var x1 = cropped.x1 * widthRatio,
				x2 = cropped.x2 * widthRatio,
				y1 = cropped.y1 * heightRatio,
				y2 = cropped.y2 * heightRatio;

			var cropDimensions = [x1, y1, x2, y2];
			thumbDimensions.push(cropDimensions);

			if (++imageIndex === $('.gallery-image').length) {

				// upload data
				displayLoadScreen();
				$('#imgForm').trigger('submit');

			} else {

				// next picture
				$photoModal.attr('src', $('.gallery-image')[imageIndex].src );
				displayLoadScreen ();
			}

		} else if ($this.data('dir') === 'prev') {
		// handle prev
			thumbDimensions.pop();
			$photoModal.attr('src', $('.gallery-image')[--imageIndex].src );
			displayLoadScreen ();

		} else {
			imageIndex = -1;
			thumbDimensions = [];
		}



	});

	$(document).keypress(function(evt){checkAndDismiss(evt);});
	$(document).click(function(evt){checkAndDismiss(evt);});


	/*
	|-------------------------------------------------------------------------
	| =Shrinking logo
	|-------------------------------------------------------------------------
	*/

	function fadeIn(el) {

		if ($window.width() > 768 && !document.getElementById('edit-gallery') ) {
			$(el).css('opacity', (window.pageYOffset + (window.innerHeight / 1.4) - $(el).offset().top) / 200);
			if ($(el).css('opacity') <0.1) {
				$(el).css('opacity', 0.1);
			}
		} else {
			$(el).css('opacity', 1);
		}
	}


	function fadeInSections() {
		fadeIn('#gallery');
		fadeIn('#about');
		fadeIn('#contact');
	}

	function shrinkLogo() {
		var logo = $('#home .navbar-brand');
		if (window.pageYOffset < 90) {
			logoSize = 1 - (window.pageYOffset / 120);
			logo.css('transform', 'scale(' + logoSize + ')');
			logo.css('top', - window.pageYOffset + 20 + 'px');

		} else {
			logo.css('transform', 'scale(0.2)');
			logo.css('top', '-70px');
		}
	}

	$window.scroll( function(){

		shrinkLogo();
		fadeInSections();
	});

	function adjustEventHeight() {
		eventImageHeight = $('.event').parent('.row').parent('.active').css('height');
		$('.event').css('height', eventImageHeight);
		$('.event-image').css('height', eventImageHeight);
	}

	$('.carousel-control').click(adjustEventHeight);

	// initialize
	shrinkLogo();
	if ($window.width() > 768) {adjustEventHeight();}
	fadeInSections();
	$('#logo').animate({opacity: 1}, 400);

	/*
	|-------------------------------------------------------------------------
	| =General behavior
	|-------------------------------------------------------------------------
	*/

	$window.on({
		resize: function () {
			if ($window.width() < 768) {
				$('.event-image').css('height', 'auto');
				$('.event').css('height', 'auto');
			} else {
				$('.event-image').css('height', '400px');
				$('.event').css('height', '400px');
			}
			fadeInSections();
			// media query detection for mozaic
			if ($mozaicSlider.width() !== mozaicWidth) {
				if (!smallMozaic) {
					$('.mozaic').mozaic();
				}
				slider.transition(null, 0);
				mozaicWidth = slider.mozaicWidth;
				smallMozaic = ($mozaicSlider.width() <720) ? true : false;
			}
		},
		keyup: function(event) {
			if (event.keyCode === 27) {
				$photoModal.attr('src', '');
				removeLoadScreen();
			}
		}
	});

	/*
	|-------------------------------------------------------------------------
	| =form validation
	|-------------------------------------------------------------------------
	*/

	/*
	Jquery Validation using jqBootstrapValidation
	example is taken from jqBootstrapValidation docs
	*/

	$(function() {

		$('#contact').find('input, textarea').jqBootstrapValidation({
			submitSuccess: function(form, event) {
				event.preventDefault(); // prevent default submit behaviour
				// get values from FORM
				// form.trigger('resetSuccess');
				var name = form[0].name.value;
				var email = form[0].email.value;
				var message = form[0].message.value;
				var firstName = name; // For Success/Failure Message
					// Check for white space in name for Success/Fail message
				if (firstName.indexOf(' ') >= 0) {
					firstName = name.split(' ').slice(0, -1).join(' ');
				}
				$.ajax({
					url: '../app/inc/submit_message.php',
					type: 'POST',
					data: {name: name, email: email, message: message},
					cache: false,
					success: function(data) {
						// Success message
						// form.find('#success').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Your message has been sent.</strong></div>');
						form.find('#success').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + data + '</div>');

						//clear message field
						form.trigger('reset');
					},
					error: function(data, status, error) {
						// Fail message
						if (error.length === 0) {
							error = 'it seems that your message has failed to send. Please try again or email us directly using the link below. ';
						}
						form.find('#success').append('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + error + '</div>');
						form.find('.btn').attr('disabled', 'disabled');

					}
				});
				form.on({
					reset: function() {
						form.find('#message').html('');
					},
					resetSuccess: function () {
						form.find('#success').html('');
					}
				});
			},
			submitError: function (form) {
				// clear success message
				form.find('#success').html('');
			}
		}).focus(function() {
			// When clicking on form, hide fail/success boxes
			$('#success').html('');
			$('#contact').find('.btn').removeAttr('disabled');
		});

	});



	/*
	|-------------------------------------------------------------------------
	| =Admin section
	|-------------------------------------------------------------------------
	*/

	// events
	$('.adminForm').on('click', '.changeImage', function(event) {
		event.preventDefault();
		$(this).siblings('.imageUpload').trigger('click');
	}).on({
		change: function(event) {
			if (event.target.files.length >0) {
				updateCurEvent();
				this.submit();
			}
		},
		submit: function() {
			updateCurEvent();
		}
	});

	function updateCurEvent () {
		var curEvent = $('.carousel-inner').find('.active').data('index');
		$('.curEvent').attr('value', curEvent);
	}

	// $('.changeModalImage').on('click', function(event) {
	// event.preventDefault();
	//   $(this).siblings('.modalImageUpload').trigger('click');
	// });

	$('.modal-title').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			$(this).siblings('.modal-body').focus();
		}
	});

	/*
	|-------------------------------------------------------------------------
	| =edit gallery
	|-------------------------------------------------------------------------
	*/

	function displayImages(src, dest){
		if (dest === 'main-img') {
			$('.main-img').attr('src', src);

			$('.mainLabel').show();
		} else {
			$('#img-lst').append('<li><div><p>Remove?</p></div><img src="' +src + '" class="gallery-image"></li>');
			$('.imagesLabel').show();
		}
	}

	$('#edit-gallery').on('focus', 'input', function() {
		removeError($(this));
	});

	function removeError(obj){
		if (obj.hasClass('hasError')){
			obj.removeClass('hasError')
				.siblings('.validationError').text('');
		}
	}

	$('#imgForm').on('click', 'button', function() {
		$(this).siblings(':file').trigger('click');
		removeError($(this));
		return false;
	});

	$('#edit-gallery').on('click', '#img-lst li', function() {
		galleryImages.splice($(this).index(), 1);
		$(this).remove();
	});

	function readFile(obj, dest, file, lastFile){

		if (file.size > (5*1024*1024) ) {
			$(obj).addClass('hasError')
				.siblings('.validationError').text('Error: Max size for each image is 5MB.');
			removeLoadScreen ();
			return false;
		} else {
			$(obj).removeClass('hasError')
				.siblings('.validationError').text('');
		}

		var reader = new FileReader();

		$(reader).on('loadend', function () {
			displayImages(this.result, dest);

			if (lastFile) {
				removeLoadScreen ();
			}

		});

		reader.readAsDataURL(file);

		if (dest === 'main-img') {
			mainImage = file;
		} else {
			galleryImages.push(file);
		}
	}

	$('#edit-gallery').on('change', ':file', function() {
		var dest = this.name;
		var files = this.files;
		var lastFile;
		if (files.length === 0) { return false; }
		displayLoadScreen ();
		$.each(files, function(index, val) {
			lastFile = (index === files.length - 1);
			readFile(this, dest, val, lastFile);
		});

	});

	function isPrime (n){
		var q = parseInt(Math.sqrt (n), 10);
		for (var i = 2; i <= q; i++){
			if (n % i === 0){
				return false;
			}
		}
		return true;
	}

	function validateFields (mainImage, galleryImages) {
		var	picMIMEs = /(image\/jpeg)|(image\/gif)|(image\/png)/,
			galName = $('#gallery_name'),
			val = galName.val();

		if ( val.length === 0 ){

			return displayError(galName, 'Please enter a name for the gallery.');
		}

		if (!picMIMEs.test(mainImage.type)) {

			return displayError('#main-img', 'Please choose a valid main image.', 'Please choose .JPG, .GIF or .PNG images smaller than 10MB.');
		}

		if(galleryImages.length === 0 ||isPrime(galleryImages.length)){

			return displayError('#images', 'Please choose valid gallery images.', 'Please choose .JPG, .GIF or .PNG images smaller than 10MB.Please make sure the number of images in the gallery is not a prime number.');
		}

		$.each(galleryImages, function(index, val) {
			if (!picMIMEs.test(val.type)) {

				return displayError('#images', 'Please choose valid gallery images.', 'Please choose .JPG, .GIF or .PNG images smaller than 10MB.Please make sure the number of images in the gallery is not a prime number.');
			}
		});

		return true;
	}

	function displayError (target, text, tooltip) {
		$(target).addClass('hasError')
			.siblings('.validationError')
			.text(text)
			.tooltip({placement: 'right', title: tooltip});
		return false;
	}

	function numberOfRows (thumbAmount) {
		// if root of thumbAmount is a whole number, return it.
		if (Math.sqrt(thumbAmount) % 1 === 0) { return Math.sqrt(thumbAmount); }
		var result = 0;
		for (var i = 2; i <thumbAmount; i++){
			if (thumbAmount % i === 0) {
				if (thumbAmount / i === result) {
					return result;
				}
				result = i;
			}
		}
	}

	function getThumbAspect(){
		var thumbHeight = 400 / rowNum;
		var thumbWidth = 1140 / ( galleryImages.length / rowNum );
		return thumbWidth + ':' + thumbHeight;
	}

	$('#edit-gallery').on('click', '#gallery-edit-submit', function(event) {
		event.preventDefault();
		if (validateFields(mainImage, galleryImages)) {
			var $mainImage = $('.main-img'),
				src = $mainImage.attr('src');

			// init crop
			thumbAspect = '1140:400';
			crop = $photoModal.imgAreaSelect({
				handles: 'corners',
				persistent: true,
				instance: true,
				hide: true,
				zIndex: 99999
			});

			$photoModal.attr('src', src);
			displayLoadScreen ();
		}
	});

	$('#edit-gallery').on('submit', '#imgForm', function(event) {
		event.preventDefault();

		if (validateFields(mainImage, galleryImages)) {
			var formData = new FormData();

			formData.append('mainImage', mainImage);
			formData.append('galleryName', $('#gallery_name').val());
			formData.append('number_of_rows', rowNum);
			formData.append('number_of_images', galleryImages.length);
			formData.append('thumbDimensions', thumbDimensions[0]);
			sendFormData(formData);

		}
	});

	function sendFormData(formData){
		$.ajax({
			url: 'inc/gallery_uploads.php',
			type: 'POST',
			success: successHandler,
			error: errorHandler,
			data: formData,
			//Options to tell jQuery not to process data or worry about content-type.
			cache: false,
			contentType: false,
			processData: false
		});
	}

	function sendGalleryImages(galleryImages, thumbDimensions){

		$.each(galleryImages, function(index, val) {
			var formData = new FormData();
			formData.append('galleryImages', val);
			formData.append('thumbDimensions', thumbDimensions[index +1]);
			formData.append('galleryName', $('#gallery_name').val());
			formData.append('index', index);
			sendFormData(formData);
		});

	}

	function successHandler(data, status){
		if (data.indexOf('Main image uploaded') >= 0 ) {
			$('progress').addClass('spinner-cast').attr('max', galleryImages.length);
			sendGalleryImages(galleryImages, thumbDimensions);
		} else if (data.indexOf('<br') >= 0 ){
			errorHandler(data);
		} else if (status === 'success') {

			testCounter++;
			$('progress').attr('value', testCounter);
			if (testCounter === galleryImages.length) {
				window.location.href = 'index.php';
			}
		}
	}

	function errorHandler (jqhxr, textStatus, data) {
		removeLoadScreen();
		$('progress').removeClass('spinner-cast');
		$('<h1 class="error-message">Error uploading files!</h1><p>' + data + '</p>').insertAfter('#home');
	}

	/*
	|-------------------------------------------------------------------------
	| =Smooth scrolling
	|-------------------------------------------------------------------------
	*/

	function filterPath(string) {
		return string
		.replace(/^\//,'')
		.replace(/(index|default).[a-zA-Z]{3,4}$/,'')
		.replace(/\/$/,'');
	}

	// use the first element that is "scrollable"
	function scrollableElement() {
		for (var i = 0, argLength = arguments.length; i <argLength; i++) {
			var el = arguments[i],
			$scrollElement = $(el);
			if ($scrollElement.scrollTop()>0) {
				return el;
			} else {
				$scrollElement.scrollTop(1);
				var isScrollable = $scrollElement.scrollTop()>0;
				$scrollElement.scrollTop(0);
				if (isScrollable) {
					return el;
				}
			}
		}
		return [];
	}

	var locationPath = filterPath(location.pathname);
	var scrollElem = scrollableElement('html', 'body');

	$('a[href*=#]').each(function() {
		var carousel = /#car.+/;
		var modal = /#modal.+/;
		var thisPath = filterPath(this.pathname) ||locationPath;
		if (( locationPath === thisPath && (location.hostname === this.hostname || !this.hostname) && this.hash.replace(/#/,'') ) &&
			!(carousel.test(this.hash) ||modal.test(this.hash))) {
			var $target = $(this.hash), target = this.hash;
			if (target) {
				$(this).click(function(event) {
					var targetOffset = $target.offset().top;
					$('#navbar-collapse-1').attr('class', 'collapse navbar-collapse');
					event.preventDefault();
					$(scrollElem).animate({scrollTop: targetOffset}, scrollSpeed, function() {
						location.hash = target;
					});
				});
			}
		}
	});

	updateCurEvent();

}());
