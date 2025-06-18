// frontend/src/components/BookDetails/ChatTab.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Loader2, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';

interface ChatTabProps {
    bookId: string;
}

interface QA {
    q: string;
    a: string;
}

const ChatTab = ({ bookId }: ChatTabProps) => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<QA[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const streamedAnswerRef = useRef<string>('');
    const hasEnded = useRef(false);
    const queueRef = useRef<string[]>([]);
    const intervalRef = useRef<number | null>(null);

    const startStreaming = () => {
        if (intervalRef.current) return;
        intervalRef.current = window.setInterval(() => {
            if (queueRef.current.length === 0) return;
            const nextChar = queueRef.current.shift();
            if (nextChar !== undefined) {
                streamedAnswerRef.current += nextChar;
                setCurrentAnswer(streamedAnswerRef.current);
            }
        }, 10);
    };

    const stopStreaming = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await authenticatedFetch<any>(
                    `${import.meta.env.VITE_API_URL}/chat/history?book_id=${bookId}`
                );
                const raw = data.history;
                const pairs: QA[] = [];
                for (let i = 0; i < raw.length; i++) {
                    if (raw[i].role === 'user' && raw[i + 1]?.role === 'assistant') {
                        pairs.push({ q: raw[i].content, a: raw[i + 1].content });
                        i++;
                    }
                }
                setHistory(pairs);
            } catch (err) {
                console.error('Error loading chat history', err);
            }
        };
        loadHistory();
    }, [bookId]);

    const handleClearHistory = async () => {
        if (loading) return;
        try {
            await authenticatedFetch(
                `${import.meta.env.VITE_API_URL}/chat/history?book_id=${bookId}`,
                {
                    method: 'DELETE'
                }
            );
            setHistory([]);
            streamedAnswerRef.current = '';
            setCurrentAnswer(null);
        } catch (err) {
            console.error('Error clearing history', err);
        }
    };

    const finalize = () => {
        if (hasEnded.current) return;
        hasEnded.current = true;
        stopStreaming();
        const finalAnswer = streamedAnswerRef.current;
        setHistory((prev) => [...prev, { q: question, a: finalAnswer }]);
        setCurrentAnswer(finalAnswer);
        setTimeout(() => {
            setCurrentAnswer(null);
            streamedAnswerRef.current = '';
        }, 100);
        setQuestion('');
        setLoading(false);
    };

    const handleAsk = () => {
        if (!question.trim()) return;
        hasEnded.current = false;
        setLoading(true);
        setCurrentAnswer('');
        streamedAnswerRef.current = '';
        queueRef.current = [];

        // For streaming, EventSource does NOT support custom headers (including Authorization).
        // If your backend expects Authorization, you have to use cookies/session or add token as a query param.
        // If your backend supports token in query param for /chat/stream, do this:
        const token = localStorage.getItem('access_token');
        const url = `${import.meta.env.VITE_API_URL}/chat/stream?question=${encodeURIComponent(
            question
        )}&book_id=${bookId}${token ? `&access_token=${encodeURIComponent(token)}` : ''}`;

        const source = new EventSource(url);

        source.onmessage = (event) => {
            queueRef.current.push(...event.data);
            startStreaming();
        };

        source.addEventListener('done', () => {
            source.close();
            const waitForDrain = setInterval(() => {
                if (queueRef.current.length === 0) {
                    clearInterval(waitForDrain);
                    finalize();
                }
            }, 500);
        });

        source.onerror = () => {
            source.close();
            finalize();
        };

        setTimeout(() => {
            if (!hasEnded.current) {
                source.close();
                finalize();
            }
        }, 30000);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) handleAsk();
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentAnswer, history]);

    return (
        <div className="bg-[#F9F6F6] p-6 rounded-2xl shadow-md space-y-6" style={{ fontFamily: '"bw gradual", sans-serif' }}>
            {/* Header + Ask form */}
            <div className="bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#BB0003]">Ask a question about the book</h3>
                    <button
                        onClick={handleClearHistory}
                        disabled={loading}
                        className="flex items-center text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4 mr-1" /> Clear History
                    </button>
                </div>
                <div className="flex space-x-2">
                    <input
                        autoFocus
                        type="text"
                        className="flex-grow rounded-full px-4 py-3 bg-gray-100 text-black placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF1A1E]/40 transition"
                        placeholder="e.g. What happens in chapter 5?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        onClick={handleAsk}
                        className="bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] hover:opacity-90 p-3 rounded-full text-white transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
                    </button>
                </div>
            </div>

            {/* Chat area */}
            <div className="bg-white rounded-lg p-6 shadow space-y-4 max-h-[550px] overflow-y-auto">
                {history.length === 0 && !currentAnswer && !loading ? (
                    <p className="text-gray-500 italic text-center">
                        Ask anything about the story. Characters, plot, hidden meanings...
                    </p>
                ) : (
                    <>
                        {history.map((item, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex justify-end items-start space-x-2">
                                    <div className="max-w-lg bg-gray-100 text-black rounded-xl px-4 py-2">
                                        {item.q}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black text-sm">
                                        👤
                                    </div>
                                </div>

                                <div className="flex justify-start items-start space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[rgba(255,26,30,0.2)] flex items-center justify-center text-black text-sm">
                                        🤖
                                    </div>
                                    <div className="max-w-lg bg-[rgba(255,26,30,0.05)] text-gray-800 rounded-xl px-4 py-2 whitespace-pre-line">
                                        {item.a}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {currentAnswer && (
                            <div className="space-y-4">
                                <div className="flex justify-end items-start space-x-2">
                                    <div className="max-w-lg bg-gray-100 text-black rounded-xl px-4 py-2">
                                        {question}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black text-sm">
                                        👤
                                    </div>
                                </div>
                                <div className="flex justify-start items-start space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[rgba(255,26,30,0.2)] flex items-center justify-center text-black text-sm">
                                        🤖
                                    </div>
                                    <div className="max-w-lg bg-[rgba(255,26,30,0.05)] text-gray-800 rounded-xl px-4 py-2 whitespace-pre-line">
                                        {currentAnswer}
                                        <span className="animate-pulse text-gray-400">|</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && !currentAnswer && (
                            <div className="flex justify-start items-start space-x-2">
                                <div className="w-8 h-8 rounded-full bg-[rgba(255,26,30,0.2)] flex items-center justify-center text-black text-sm">
                                    🤖
                                </div>
                                <div className="max-w-lg bg-[rgba(255,26,30,0.05)] text-gray-700 rounded-xl px-4 py-2">
                                    <span className="inline-block animate-bounce">.</span>
                                    <span className="inline-block animate-bounce delay-150">.</span>
                                    <span className="inline-block animate-bounce delay-300">.</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatTab;
