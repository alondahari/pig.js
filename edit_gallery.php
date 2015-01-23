<?php
if (isset($_POST['remGallery'])) {
	// remove row from db
	$galleryName = getRows("`index` = {$_POST['curGallery']}", "name", 'galleries', $conn);

	// delete files
	if (isset($galleryName[0][0]) && !empty($galleryName[0][0])) {
		$galleryPath = GALLERY_PATH . $galleryName[0][0];
		recursiveRemoveDirectory($galleryPath);
		remRow($_POST['curGallery'], 'galleries', $conn);
	} else {
		echo "Error deleting files.";
	}

	// go back
	header('Location: index.php');

}

?>

<section id="home">
  <div class="row">
    <a class="navbar-brand" href="#home"><h1 id="logo">Formosa Nights</h1></a>
      <h3>Michael's admin page! <a href="logout.php" id="logOut">Logout</a></h3>
  </div>

</section>

<h1>Add a new Gallery</h1>
<p>Easy as 1 2 3... choose your main image and images for the gallery. Avoid uploading a prime number of images, the end result comes out bad.</p>
<p>Next step would take you through specifying the thumbnails. Once you're finished you'll be directed back for preview.</p>
<p>Duplicates are allowed, so pay attention not to put some by mistake.</p>
<?php if (isset($error)): ?>
	<p id="error">
		<?php echo $error ?>
	</p>
<?php endif ?>

<div id="edit-gallery">
	
	<form method="POST" enctype="multipart/form-data" id="imgForm">
			
		<p>
			<label for="gallery_name">Gallery Name</label>
			<input type="text" name="gallery_name" id="gallery_name" maxlength="25" placeholder="e.g. flirt!">
			<span class="validationError"></span>
		</p>
		
		<p>
			<label for="img_upload">Main gallery image</label>
			<button id="main-img">Upload File...</button>
			<input type="file" name="main-img" accept="image/*">
			<span class="validationError"></span>

		</p>		

		<p>
			<label for="img_upload">Gallery images</label>
			<button id="images">Upload File(s)...</button>
			<input type="file" name="images" accept="image/*" multiple>
			<span class="validationError"></span>
		</p>

		<input type="submit" name="submit" value="Create thumbnails" id="gallery-edit-submit">
		<a href="index.php">Go back</a>


	</form>

	<h3 class="mainLabel">Main Image</h3>
	<img src="" alt="" class="main-img">

	<h3 class="imagesLabel">Gallery Images</h3>
	<ul id="img-lst">
		
	</ul>
</div>
