const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const urlPath = `/uploads/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      imageUrl: urlPath,
      message: "Image uploaded successfully",
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

module.exports = { uploadImage };
