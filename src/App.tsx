// frontend/src/App.tsx

import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

import { useState, useEffect } from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import BookCard from './components/BookCard';
import UploadArea from './components/UploadArea';
import BookDetails from './components/BookDetails/BookDetails';
import LoginModal from './components/LoginModal';
import { authenticatedFetch } from './utils/api';

interface Book {
    id: string;
    user_id: string;
    title: string;
    cover: string;
    author: string;
    uploadDate: string;
    progress: number;
    synopsis: string;
    full_text: string;
    chunks: [];
    hasDetails: boolean;
}

interface User {
    id: string;
    email: string;
    username: string;
    full_name?: string;
}

function isLoggedIn() {
    return !!localStorage.getItem('access_token');
}

function App() {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        fetchBooks();
        if (isLoggedIn()) {
            fetchCurrentUser();
        } else {
            setUser(null);
            setIsLoadingUser(false);
        }
    }, []);

    const fetchBooks = async () => {
        try {
            const data = await authenticatedFetch<Book[]>(
                `${import.meta.env.VITE_API_URL}/books`
            );
            setBooks(data);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const userData = await authenticatedFetch<User>(
                `${import.meta.env.VITE_API_URL}/auth/me`
            );
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user:", error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        fetchCurrentUser();
        fetchBooks();
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        fetchBooks();
    };

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
    };

    const handleBookDelete = (deletedId: string) => {
        setBooks((prev) => prev.filter((b) => b.id !== deletedId));
    };

    if (isLoadingUser) {
        return (
            <ThemeProvider>
                <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#18181b] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                    </div>
                </div>
                <ThemeToggle />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            {/* Theme toggle always visible */}
            <ThemeToggle />

            <div
                className="min-h-screen bg-[#FAFAFA] dark:bg-[#18181b] text-black dark:text-white transition-colors"
                style={{ fontFamily: '"bw gradual", sans-serif' }}
            >
                {/* NAV BAR */}
                <nav className="bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] dark:from-[#3a0d0f] dark:to-[#18181b] text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <img src="/logo2.png" alt="Logo" className="h-11 w-auto" />

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <UserCircle className="h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        {user.full_name || user.username}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 hover:text-white/80 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="flex items-center space-x-2 hover:text-white/80 transition-colors"
                            >
                                <UserCircle className="h-6 w-6" />
                                <span className="text-sm font-medium">Sign In</span>
                            </button>
                        )}
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {selectedBook ? (
                        <BookDetails
                            book={selectedBook}
                            onBack={() => {
                                setSelectedBook(null);
                                fetchBooks();
                            }}
                        />
                    ) : (
                        <>
                            {/* UPLOAD AREA or LOGIN PROMPT */}
                            {user ? (
                                <UploadArea onUploadSuccess={fetchBooks} />
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 mb-8 shadow text-center">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                                        Want to add your own book?
                                    </p>
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        type="button"
                                        className="px-6 py-2 bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] dark:from-[#3a0d0f] dark:to-[#18181b] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                                    >
                                        Log into your account to upload your book
                                    </button>
                                </div>
                            )}

                            {/* BOOK GRID */}
                            <div className="mt-12">
                                <h2 className="text-2xl font-semibold mb-6">
                                    {user ? 'Your Books' : 'Featured Books'}
                                </h2>

                                {books.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                            {user
                                                ? 'No books uploaded yet. Upload your first book!'
                                                : 'No books available.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {books.map((book) => (
                                            <BookCard
                                                key={book.id}
                                                book={book}
                                                hasDetails={book.hasDetails}
                                                onClick={() => handleBookClick(book)}
                                                onDelete={handleBookDelete}
                                                canDelete={!!user && book.user_id === user.id && book.user_id !== "public"}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>

                {/* LOGIN MODAL */}
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        </ThemeProvider>
    );
}

export default App;
