
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


