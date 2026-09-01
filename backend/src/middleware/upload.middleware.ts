import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedExtensions = [
    ".pdf",
    ".txt",
  ];

  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/x-pdf",
  ];

  const isValidExtension =
    allowedExtensions.includes(extension);

  const isValidMimeType =
    allowedMimeTypes.includes(file.mimetype);

  /*
   * Some clients/operating systems may send
   * application/octet-stream for a PDF.
   *
   * We therefore allow the known PDF/TXT
   * extensions here and perform deeper validation
   * after the file reaches the controller.
   */
  if (isValidExtension || isValidMimeType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF and TXT files are supported"
      )
    );
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;