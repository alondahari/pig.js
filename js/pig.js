(function () {
	'use strict';

	// media query detection
	var modalScreen = $('.screen'),
		spinner = $('.ring1'),
		$photoModal = $('.photo-modal'),
		$mozaicSlider = $('.mozaicSlider'),
		slider, mozaicWidth, smallMozaic;

	function displayLoadScreen () {
		modalScreen.addClass('cast');
		spinner.addClass('spinner-cast');
	}

	function removeLoadScreen () {
		modalScreen.removeClass('cast');
		spinner.removeClass('spinner-cast');
	}


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


	/*
	|-------------------------------------------------------------------------
	| =General behavior
	|-------------------------------------------------------------------------
	*/

	$(window).on({
		resize: function () {
			if (this.innerWidth < 768) {
				$('.event-image').css('height', 'auto');
				$('.event').css('height', 'auto');
			} else {
				$('.event-image').css('height', '400px');
				$('.event').css('height', '400px');
			}
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


	

}());
