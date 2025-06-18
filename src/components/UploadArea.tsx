// frontend/src/components/UploadArea.tsx

import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';

interface UploadAreaProps {
    onUploadSuccess: () => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const manuscriptInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (coverFile) formData.append("cover", coverFile);
        formData.append("title", title);
        formData.append("author", author);

        try {
            // Pass the form directly and omit Content-Type header (browser sets it)
            await authenticatedFetch(
                `${import.meta.env.VITE_API_URL}/books/upload`,
                {
                    method: "POST",
                    body: formData,
                    headers: {} // Force NO Content-Type so browser uses multipart/form-data
                }
            );
            onUploadSuccess?.();
        } catch (err) {
            console.error("Error uploading:", err);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setSelectedFile(null);
            setCoverFile(null);
            setTitle("");
            setAuthor("");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setSelectedFile(file);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors bg-[#FFF5F5] ${
                isDragging ? "border-[#FF1A1E]/80 bg-[#FFF0F0]" : "border-[#FF1A1E]/50 hover:border-[#FF1A1E]"
            }`}
            style={{ fontFamily: '"bw gradual", sans-serif' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isUploading ? (
                <div className="space-y-4">
                    <Loader2 className="h-12 w-12 text-[#BB0003] animate-spin mx-auto" />
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-[#BB0003] text-lg">
                        Analyzing your book... {uploadProgress}%
                    </p>
                </div>
            ) : (
                <>
                    <Upload className="h-12 w-12 text-[#BB0003] mx-auto mb-4" />
                    <p className="text-[#BB0003] text-lg mb-2">
                        Drag and drop your manuscript here
                    </p>
                    <p className="text-[#BB0003]/70">or</p>

                    {/* 👇 Hidden manuscript file input */}
                    <input
                        type="file"
                        id="manuscriptInput"
                        ref={manuscriptInputRef}
                        accept=".txt, .pdf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedFile(file);
                            }
                        }}
                    />
                    <label htmlFor="manuscriptInput">
                        <button
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                            onClick={() => manuscriptInputRef.current?.click()}
                        >
                            Choose File
                        </button>
                    </label>

                    <div className="flex flex-col items-center mt-4 gap-2">
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="p-2 rounded w-full max-w-md border border-gray-300"
                        />
                        <input
                            type="text"
                            placeholder="Author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="p-2 rounded w-full max-w-md border border-gray-300"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            ref={coverInputRef}
                            id="coverInput"
                            className="hidden"
                            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                        />
                        <label htmlFor="coverInput">
                            <button
                                className="mt-1 px-6 py-2 bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                Add a Cover
                            </button>
                        </label>
                    </div>

                    {selectedFile && (
                        <div className="text-[#333] mt-4">
                            <p className="font-medium">📘 Selected manuscript:</p>
                            <p className="italic">{selectedFile.name}</p>
                        </div>
                    )}

                    {coverFile && (
                        <div className="mt-4 flex flex-col items-center">
                            <img
                                src={URL.createObjectURL(coverFile)}
                                alt="Cover preview"
                                className="rounded-md max-h-40"
                            />
                        </div>
                    )}

                    {selectedFile && (
                        <p className="text-[#666] text-sm mt-2 italic">
                            Ready to upload – don’t forget title, author, and cover!
                        </p>
                    )}

                    <button
                        className={`mt-6 px-6 py-2 rounded-lg font-medium transition-colors ${
                            selectedFile
                                ? "bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] text-white hover:opacity-90"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={handleUpload}
                        disabled={!selectedFile}
                    >
                        Upload Book
                    </button>
                </>
            )}
        </div>
    );
};

export default UploadArea;
