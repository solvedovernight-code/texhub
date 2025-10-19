import React, { useState, useEffect } from 'react';
import { Book, Search, Upload as UploadIcon, Eye, Download, Calendar, User, X, Filter, SortAsc, Grid, List, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UploadBookDialog } from '../components/UploadBookDialog';
import { Book as BookType, BookUploadData } from '../types/book';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PDFViewer } from '../components/PDFViewer';

interface BookLibraryProps {
  user: any;
}

export function BookLibrary({ user }: BookLibraryProps) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'views' | 'downloads'>('date');

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksRef = collection(db, 'books');
      const q = query(booksRef, orderBy('uploadDate', 'desc'));
      const snapshot = await getDocs(q);
      const loadedBooks: BookType[] = [];
      snapshot.forEach((doc) => {
        loadedBooks.push({ id: doc.id, ...doc.data() } as BookType);
      });
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
      alert('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.bookName.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
    );
    setFilteredBooks(filtered);
  };

  const convertGoogleDriveUrl = (url: string, isImage: boolean = false): string => {
    try {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[0];
        if (isImage) {
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return url;
    } catch (error) {
      return url;
    }
  };

  const handleUploadBook = async (data: BookUploadData) => {
    try {
      if (!data.coverPhotoUrl || !data.pdfUrl) {
        throw new Error('Missing Google Drive URLs');
      }

      const timestamp = new Date().toISOString();

      const newBook: Omit<BookType, 'id'> = {
        bookName: data.bookName,
        author: data.author,
        description: data.description,
        coverPhotoUrl: data.coverPhotoUrl,
        pdfUrl: data.pdfUrl,
        uploaderId: user.uid,
        uploaderName: user.displayName || user.email || 'Anonymous',
        uploaderEmail: user.email || '',
        uploadDate: timestamp,
        fileSize: data.fileSize || 0,
        downloads: 0,
        views: 0,
      };

      const docRef = await addDoc(collection(db, 'books'), newBook);
      setBooks([{ id: docRef.id, ...newBook }, ...books]);
      alert('Book uploaded successfully!');
    } catch (error) {
      console.error('Error uploading book:', error);
      throw error;
    }
  };

  const handleViewBook = async (book: BookType, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const bookRef = doc(db, 'books', book.id);
      await updateDoc(bookRef, {
        views: increment(1),
      });

      setBooks(books.map(b => b.id === book.id ? { ...b, views: b.views + 1 } : b));

      setSelectedBook(book);
      setViewerOpen(true);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const handleDownloadBook = async (book: BookType, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const bookRef = doc(db, 'books', book.id);
      await updateDoc(bookRef, {
        downloads: increment(1),
      });

      setBooks(books.map(b => b.id === book.id ? { ...b, downloads: b.downloads + 1 } : b));

      const fileIdMatch = book.pdfUrl.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[0];
        window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
      } else {
        window.open(book.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error updating downloads:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Book className="w-16 h-16 text-primary mx-auto animate-pulse" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="h-2 w-48 bg-primary/20 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
            <p className="text-muted-foreground text-sm">Loading library...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.bookName.localeCompare(b.bookName);
      case 'views':
        return b.views - a.views;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'date':
      default:
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {!viewerOpen ? (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm px-4 md:px-6 py-6 md:py-8 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-primary/20 p-2 md:p-3 rounded-lg">
                    <Book className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Book Library</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Share and discover textile industry books</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 self-start md:self-auto"
                >
                  <UploadIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Upload Book
                </Button>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by book name, author, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 bg-background border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="date">Latest</option>
                    <option value="name">Name</option>
                    <option value="views">Most Viewed</option>
                    <option value="downloads">Most Downloaded</option>
                  </select>
                  <div className="flex gap-1 bg-background border border-border rounded-md p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {sortedBooks.length === 0 ? (
                <div className="text-center py-16">
                  <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? 'No books found matching your search' : 'No books available yet'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                  {sortedBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-border hover:border-primary/50 cursor-pointer"
                      onClick={(e) => handleViewBook(book, e)}
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted via-muted to-primary/5">
                        <img
                          src={convertGoogleDriveUrl(book.coverPhotoUrl, true)}
                          alt={book.bookName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-foreground shadow-lg">
                          {formatFileSize(book.fileSize)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                      </div>

                      <div className="p-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                        <h3 className="font-bold text-sm text-foreground mb-1 truncate relative z-10" title={book.bookName}>
                          {book.bookName}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 relative z-10 truncate">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{book.author}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 relative z-10" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {book.description}...
                        </p>

                        <div className="border-t border-border pt-2 space-y-1.5 relative z-10">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              <Eye className="w-3 h-3" />
                              {book.views}
                            </span>
                            <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                              <Download className="w-3 h-3" />
                              {book.downloads}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-border hover:border-primary/50 flex flex-col sm:flex-row cursor-pointer"
                      onClick={(e) => handleViewBook(book, e)}
                    >
                      <div className="relative w-full sm:w-32 h-32 sm:h-auto overflow-hidden bg-gradient-to-br from-muted to-primary/5 flex-shrink-0">
                        <img
                          src={convertGoogleDriveUrl(book.coverPhotoUrl, true)}
                          alt={book.bookName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop';
                          }}
                        />
                      </div>

                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {book.bookName}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {book.author}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(book.uploadDate)}
                          </span>
                          <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                            <Eye className="w-3 h-3" />
                            {book.views} views
                          </span>
                          <span className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-1 rounded">
                            <Download className="w-3 h-3" />
                            {book.downloads} downloads
                          </span>
                          <span>{formatFileSize(book.fileSize)}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center justify-center gap-2 p-4 border-t sm:border-t-0 sm:border-l border-border">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleViewBook(book, e)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg transition-all shadow-md"
                          title="View Book"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleDownloadBook(book, e)}
                          className="bg-secondary hover:bg-secondary/90 text-primary-foreground p-3 rounded-lg transition-all shadow-md"
                          title="Download Book"
                        >
                          <Download className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          selectedBook && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between border-b border-border"
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-primary" />
                    <h2 className="text-lg md:text-xl font-semibold text-foreground truncate pr-4">{selectedBook.bookName}</h2>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <Button
                      onClick={(e) => handleDownloadBook(selectedBook, e)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <button
                      onClick={() => {
                        setViewerOpen(false);
                        setSelectedBook(null);
                      }}
                      className="text-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
                <div className="w-full bg-background" style={{ height: 'calc(100vh - 200px)' }}>
                  <PDFViewer
                    pdfUrl={selectedBook.pdfUrl}
                    title={selectedBook.bookName}
                    onDownload={() => handleDownloadBook(selectedBook)}
                  />
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>

      <UploadBookDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUploadBook}
      />
    </div>
  );
}
