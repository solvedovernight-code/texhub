export interface Book {
  id: string;
  bookName: string;
  author: string;
  coverPhotoUrl: string;
  pdfUrl: string;
  uploaderId: string;
  uploaderName: string;
  uploaderEmail: string;
  uploadDate: string;
  description: string;
  fileSize: number;
  downloads: number;
  views: number;
}

export interface BookUploadData {
  bookName: string;
  author: string;
  description: string;
  coverPhotoUrl: string;
  pdfUrl: string;
  fileSize: number;
}

export const initialBookUploadData: BookUploadData = {
  bookName: '',
  author: '',
  description: '',
  coverPhotoUrl: '',
  pdfUrl: '',
  fileSize: 0,
};
