<?php
session_start();
require 'config.php';
require 'functions.php';
$conn = connect();
extract($_POST);
extract($_FILES);

// validate all fields sent and not empty
$galleryPath = "../" . GALLERY_PATH . $galleryName;
if ( !empty($mainImage['name']) && !empty($galleryName)){

    if (file_exists($galleryPath) ){ recursiveRemoveDirectory($galleryPath); }

    mkdir($galleryPath);

    $row_num = row_exists('name', $galleryName, 'galleries', $conn);
    $row_num = $row_num[0];

    // upload cropped main image
    $dimensions = explode(',', $thumbDimensions);
    uploadMain($mainImage['tmp_name'], $galleryPath . '/main', $dimensions);

    // update db
    if ($row_num > 0) {
        updateRow($row_num, "`name` = '$galleryName', `number_of_images` = $number_of_images", 'galleries', $conn);
    } else {
        insertRows("`name` = '$galleryName', `number_of_images` = $number_of_images", 'galleries', $conn);
    }
    $_SESSION['number_of_images_uploaded'] = 0;
    $_SESSION['number_of_rows'] = $number_of_rows;
    $_SESSION['number_of_images'] = $number_of_images;

    // Create a new temporary image for the thumbs
    $thumbsImage = imagecreatetruecolor(2400, 840);
    imagejpeg($thumbsImage, $galleryPath . '/thumbs.jpg');
    echo "Main image uploaded";
    die();


} elseif (!empty($galleryImages['name']) ) {
    // upload thumbs
    $dimensions = explode(',', $thumbDimensions);

    $newFileName = uploadThumb($galleryImages['tmp_name'], $galleryPath, $dimensions, $index);

    $_SESSION['number_of_images_uploaded'] = $_SESSION['number_of_images_uploaded'] + 1;
    if ($_SESSION['number_of_images_uploaded'] == $_SESSION['number_of_images'] ) {
        // createThumbs();      
    }
    echo $newFileName;
}

function uploadMain($file, $dest, $dimensions){
    list($x1, $y1, $x2, $y2) = $dimensions;
    $image = new ImageManipulator($file);

    $image->crop( $x1, $y1, $x2, $y2 );

    $image->resample(1140,400, false);

    $image->save($dest);
    $image->destroy();
}

function uploadThumb($file, $dest, $dimensions, $index){
    list($x1, $y1, $x2, $y2) = $dimensions;
    $thumbs_per_row = $_SESSION['number_of_images'] / $_SESSION['number_of_rows'];
    $width = 2400 / $thumbs_per_row;
    $height = 840 / $_SESSION['number_of_rows'];
    $dst_x = $width * ( $index % $thumbs_per_row );
    $dst_y = $height * ( floor( $index / $thumbs_per_row ) );

    $image = new ImageManipulator($file);
    $thumbsImage = new ImageManipulator($dest . '/thumbs.jpg');

    $newFileName = $image->save($dest  . '/image' . $index);

    $image->crop( $x1, $y1, $x2, $y2 );
    $image->resample($width, $height);
    imagecopy($thumbsImage->getResource(), $image->getResource(), $dst_x, $dst_y, 0, 0, $width, $height);
    $thumbsImage->save($dest . '/thumbs');
	$image->destroy();
    $thumbsImage->destroy();
    return $newFileName;
}



class ImageManipulator
{
    /**
     * @var int
     */
    protected $width;

    /**
     * @var int
     */
    protected $height;

    /**
     * @var resource
     */
    protected $image;

    /**
     * Image manipulator constructor
     *
     * @param string $file OPTIONAL Path to image file or image data as string
     * @return void
     */
    public function __construct($file = null)
    {
        if (null !== $file) {
            if (is_file($file)) {
                $this->setImageFile($file);
            } else {
                $this->setImageString($file);
            }
        }
    }

    /**
     * Set image resource from file
     *
     * @param string $file Path to image file
     * @return ImageManipulator for a fluent interface
     * @throws InvalidArgumentException
     */
    public function setImageFile($file)
    {
        if (!(is_readable($file) && is_file($file))) {
            throw new InvalidArgumentException("Image file $file is not readable");
        }

        if (is_resource($this->image)) {
            imagedestroy($this->image);
        }

        list ($this->width, $this->height, $this->type) = getimagesize($file);

        switch ($this->type) {
            case IMAGETYPE_GIF  :
                $this->image = imagecreatefromgif($file);
                break;
            case IMAGETYPE_JPEG :
                $this->image = imagecreatefromjpeg($file);
                break;
            case IMAGETYPE_PNG  :
                $this->image = imagecreatefrompng($file);
                break;
            default             :
                throw new InvalidArgumentException("Image type $type not supported");
        }

        return $this;
    }

    /**
     * Set image resource from string data
     *
     * @param string $data
     * @return ImageManipulator for a fluent interface
     * @throws RuntimeException
     */
    public function setImageString($data)
    {
        if (is_resource($this->image)) {
            imagedestroy($this->image);
        }

        if (!$this->image = imagecreatefromstring($data)) {
            throw new RuntimeException('Cannot create image from data string');
        }
        $this->width = imagesx($this->image);
        $this->height = imagesy($this->image);
        return $this;
    }

    /**
     * Resamples the current image
     *
     * @param int  $width                New width
     * @param int  $height               New height
     * @param bool $constrainProportions Constrain current image proportions when resizing
     * @return ImageManipulator for a fluent interface
     * @throws RuntimeException
     */
    public function resample($width, $height, $constrainProportions = true)
    {
        if (!is_resource($this->image)) {
            throw new RuntimeException('No image set');
        }
        if ($constrainProportions) {
            if ($this->height >= $this->width) {
                $width  = round($height / $this->height * $this->width);
            } else {
                $height = round($width / $this->width * $this->height);
            }
        }
        $temp = imagecreatetruecolor($width, $height);
        imagecopyresampled($temp, $this->image, 0, 0, 0, 0, $width, $height, $this->width, $this->height);
        return $this->_replace($temp);
    }

    /**
     * Crop image
     *
     * @param int|array $x1 Top left x-coordinate of crop box or array of coordinates
     * @param int       $y1 Top left y-coordinate of crop box
     * @param int       $x2 Bottom right x-coordinate of crop box
     * @param int       $y2 Bottom right y-coordinate of crop box
     * @return ImageManipulator for a fluent interface
     * @throws RuntimeException
     */
    public function crop($x1, $y1 = 0, $x2 = 0, $y2 = 0)
    {
        if (!is_resource($this->image)) {
            throw new RuntimeException('No image set');
        }
        if (is_array($x1) && 4 == count($x1)) {
            list($x1, $y1, $x2, $y2) = $x1;
        }

        // make sure coodinates are within image dimensions
        $x1 = max($x1, 0);
        $y1 = max($y1, 0);

        $x2 = min($x2, $this->width);
        $y2 = min($y2, $this->height);

        $width = $x2 - $x1;
        $height = $y2 - $y1;

        $temp = imagecreatetruecolor($width, $height);
        imagecopy($temp, $this->image, 0, 0, $x1, $y1, $width, $height);

        return $this->_replace($temp);
    }

    /**
     * Replace current image resource with a new one
     *
     * @param resource $res New image resource
     * @return ImageManipulator for a fluent interface
     * @throws UnexpectedValueException
     */
    protected function _replace($res)
    {
        if (!is_resource($res)) {
            throw new UnexpectedValueException('Invalid resource');
        }
        if (is_resource($this->image)) {
            imagedestroy($this->image);
        }
        $this->image = $res;
        $this->width = imagesx($res);
        $this->height = imagesy($res);
        return $this;
    }

    /**
     * Save current image to file
     *
     * @param string $fileName
     * @return new file name
     * @throws RuntimeException
     */
    public function save($fileName)
    {
        $dir = dirname($fileName);
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new RuntimeException('Error creating directory ' . $dir);
            }
        }

        try {
            switch ($this->type) {
                case IMAGETYPE_GIF  :
                    if (!imagegif($this->image, $fileName . '.gif')) {
                        throw new RuntimeException;
                    }
                    return $fileName . '.gif';
                    break;
                case IMAGETYPE_PNG  :
                    if (!imagepng($this->image, $fileName . '.png')) {
                        throw new RuntimeException;
                    }
                    return $fileName . '.png';
                    break;
                case IMAGETYPE_JPEG :
                default             :
                    if (!imagejpeg($this->image, $fileName . '.jpg', 95)) {
                        throw new RuntimeException;
                    }
                    return $fileName . '.jpg';
            }
        } catch (Exception $ex) {
            throw new RuntimeException('Error saving image file to ' . $fileName);
        }
    }

    /**
     * Destroy resource to free up memory
     *
     * @return void
     * @throws RuntimeException
     */

    public function destroy()
    {
    	if (!imagedestroy($this->image)){
    		throw new Exception("Error destroying resource");

    	}
    }

    /**
     * Returns the GD image resource
     *
     * @return resource
     */
    public function getResource()
    {
        return $this->image;
    }

    /**
     * Get current image resource width
     *
     * @return int
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * Get current image height
     *
     * @return int
     */
    public function getHeight()
    {
        return $this->height;
    }
}
