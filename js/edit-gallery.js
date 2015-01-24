/*
	|-------------------------------------------------------------------------
	| =edit gallery
	|-------------------------------------------------------------------------
	*/

	
	// gallery edit globals
	var mainImage = [],
		galleryImages = [],
		thumbDimensions = [],
		rowNum = 0;

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
