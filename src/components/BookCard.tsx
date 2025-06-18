import { Clock, User, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { authenticatedFetch } from '../utils/api';

interface BookCardProps {
    book: {
        id: string;
        title: string;
        cover: string;
        author: string;
        uploadDate: string;
        progress: number;
    };
    hasDetails: boolean;
    onClick: () => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
}

const BookCard = ({ book, hasDetails, onClick, onDelete, canDelete }: BookCardProps) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
    console.log("🗑️ Deleting book", book.id);
    try {
        const response = await authenticatedFetch(
            `${import.meta.env.VITE_API_URL}/books/${book.id}/delete`,
            { method: 'DELETE' }
        );

        console.log("✅ Deletion response:", response);

        onDelete(book.id);
    } catch (err) {
        console.error('❌ Delete failed:', err);
    } finally {
        setShowConfirm(false);
    }
};

        return (
        <div
            className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 group"
            style={{ fontFamily: '"bw gradual", sans-serif' }}
            onClick={onClick}
        >
            {/* Delete Icon, only if canDelete */}
            {canDelete && (
                <div
                    className="absolute bottom-2 right-2 z-10 p-1 bg-white/80 hover:bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] rounded-full transition group/delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirm(true);
                    }}
                    title="Delete the book"
                >
                    <Trash2 className="h-4 w-4 text-[#BB0003] group-hover/delete:text-white" />
                </div>
            )}

            {/* Book cover */}
            <div className="aspect-[3/4] relative">
                <img
                    src={`${import.meta.env.VITE_API_URL}${book.cover}?${Date.now()}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Book meta info */}
            <div className="p-3">
                <h3 className="text-sm font-semibold text-black mb-1 truncate">{book.title}</h3>
                <div className="flex items-center text-gray-500 text-xs mb-1">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{book.author}</span>
                </div>
                <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{new Date(book.uploadDate).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Hover-only overlay if book details not generated */}
            {!hasDetails && (
                <div className="absolute inset-0 bg-black/50 text-white text-sm font-medium items-center justify-center hidden group-hover:flex text-center px-4">
                    Click to generate book details
                </div>
            )}

            {/* Confirmation popup */}
            {showConfirm && canDelete && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 p-2">
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-xs text-center border border-gray-200">
                        <p className="text-black mb-4 font-medium">
                            Are you sure you want to delete this book?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={(e) => {
                                    setShowConfirm(false);
                                    e.stopPropagation();
                                }}
                                className="px-4 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => {
                                    handleDelete();
                                    e.stopPropagation();
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] text-white font-medium rounded hover:opacity-90"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookCard;
