<?php
# Upload form - validate and handle submission

if (isset($_POST['upload_form_submitted'])) {
	if (!isset($_FILES['img_upload']) || empty($_FILES['img_upload']['name'])) {
		$error = "Error: a file must be chosen";
	} elseif (!isset($_POST['img_name']) || empty($_POST['img_name'])) {
		$error = "Error: please give the new image a label";
	} else {
		$alowedMIMEs = array('image/jpeg', 'image/gif', 'image/png');
		foreach ($alowedMIMEs as $mime) {
			if ($mime == $_FILES['img_upload']['type']) {
				$mimeSplitter = explode('/', $mime);
				$fileExt = $mimeSplitter[1];
				$newPath = 'imgs/' . $_POST['img_name'] . '.' . $fileExt;
				break;
			}
		}

		if (!isset($newPath)) {
			$error = "Error: invalid file type - please upload an image file.";
		} elseif (file_exists($newPath)) {
			$error = "Error: file name already exists";
		} elseif (!copy($_FILES['img_upload']['tmp_name'], $newPath)) {  // every file about to upload is temporarily saved on the server. Here we copy it to it's new location.
			$error = "Error: could not save file to server";
		} else {
			//all ok!
			$_SESSION['newPath'] = $newPath;
			$_SESSION['fileExt'] = $fileExt;
		}
	}
}


# Crop saved image

if (isset($_GET['crop_attempt'])) {

	switch ($_SESSION['fileExt']) {

		case 'jpg': case 'jpeg':
			$source_image = imagecreatefromjpeg($_SESSION['newPath']);
			$dest_image = imagecreatetruecolor($_GET['crop_w'], $_GET['crop_h']);
			break;

		case 'gif':
			$source_image = imagecreatefromgif($_SESSION['newPath']);
			$dest_image = imagecreate($_GET['crop_w'], $_GET['crop_h']);
			break;

		case 'png':
			$source_image = imagecreatefrompng($_SESSION['newPath']);
			$dest_image = imagecreate($_GET['crop_w'], $_GET['crop_h']);
			break;
	}

	imagecopy($dest_image, $source_image, 0, 0, $_GET['crop_l'], $_GET['crop_t'], $_GET['crop_w'], $_GET['crop_h']);
	// imagecopy(dst_im, src_im, dst_x, dst_y, src_x, src_y, src_w, src_h):
	switch ($_SESSION['fileExt']) {

		case 'jpg': case 'jpeg':
			imagejpeg($dest_image, 'imgs/cropped.jpg');
			break;

		case 'gif':
			imagegif($dest_image, 'cropped_' . $_SESSION['newPath']);
			break;

		case 'png':
			imagepng($dest_image, 'cropped_' . $_SESSION['newPath']);
			break;
	}
	
	// destroy image handlers to free up memory:
	imagedestroy($dest_image);
	imagedestroy($source_image);
	header('Location: index.php'); // reset the GET arguments
}
?>
