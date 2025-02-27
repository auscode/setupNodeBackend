const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.memoryStorage();
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const projectName = req.body.title.replace(/\s+/g, "_"); 
//     const projectId = req.params.projectId || "new"; 
//     const date = new Date().toISOString().replace(/:/g, "-");
//     const ext = path.extname(file.originalname);
//     const filename = `${projectName}-${date}${ext}`;
//     cb(null, filename);
//   },
// });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only PDF and images are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // Limit to 10MB
});

module.exports = upload;
