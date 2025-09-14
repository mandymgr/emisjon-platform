import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug configuration
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'emissions',
    resource_type: 'raw' as 'raw',
    format: async () => 'pdf',
    public_id: () => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `emission-${uniqueSuffix}`;
    }
  }
} as any);

// File filter to only accept PDFs
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File filter - mimetype:', file.mimetype);
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Configure multer
const uploadPDF = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware wrapper with error handling
export const uploadEmissionPDF = (req: Request, res: Response, next: NextFunction): void => {
  const upload = uploadPDF.single('presentationFile');
  
  upload(req, res, (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'File too large. Maximum size is 50MB' });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ error: err.message || 'File upload failed' });
      return;
    }
    
    // Log successful upload details
    if (req.file) {
      console.log('File uploaded successfully:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: (req.file as any).path,
        filename: (req.file as any).filename,
        secure_url: (req.file as any).secure_url,
        public_id: (req.file as any).public_id,
        url: (req.file as any).url
      });
    } else {
      console.log('No file in request');
    }
    
    next();
  });
};