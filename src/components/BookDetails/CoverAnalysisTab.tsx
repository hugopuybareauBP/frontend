// frontend/src/components/BookDetails/CoverAnalysisTab.tsx

import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { Check, AlertTriangle } from 'lucide-react';
import { emojiColorMap } from '../../utils/emojiColorMap';
import { authenticatedFetch } from '../../utils/api';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/5 rounded-xl p-6 shadow-sm ${className}`}>{children}</div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xl font-semibold text-[#FF1A1E] border-b border-[#FF1A1E]/30 pb-3">{children}</h2>
);

interface CoverElement {
    category: string;
    title: string;
    description: string;
    icon?: string;
}

interface FeedbackBlock {
    element: string;
    what_works: string;
    what_could_be_better: string;
}

interface Props {
    bookId: string;
    cover: string;
}

const CoverAnalysisTab: React.FC<Props> = ({ bookId, cover }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTemporaryCover, setIsTemporaryCover] = useState(false);
    const [analysis, setAnalysis] = useState<CoverElement[] | null>(null);
    const [feedback, setFeedback] = useState<{ aesthetic_breakdown: FeedbackBlock[]; actionable_tweaks: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    const imagePath = isTemporaryCover
        ? `${import.meta.env.VITE_API_URL}/covers/temp_${bookId}.png?${Date.now()}`
        : `${import.meta.env.VITE_API_URL}${cover}?${Date.now()}`;

    useEffect(() => {
        console.log("[STATE] isTemporaryCover =", isTemporaryCover);
    }, [isTemporaryCover]);

    // CHECK IF TEMP COVER EXISTS (auth required)
    const checkTempCover = async () => {
        try {
            const data = await authenticatedFetch<any>(
                `${import.meta.env.VITE_API_URL}/is_cover_temporary/${bookId}`
            );
            setIsTemporaryCover(data.temporary_exists);
        } catch (err) {
            console.error("[TEMP COVER CHECK] Failed", err);
        }
    };

    // FETCH ANALYSIS AND FEEDBACK (auth required)
    const fetchAll = async () => {
        setLoading(true);
        try {
            const fullData = await authenticatedFetch<any>(
                `${import.meta.env.VITE_API_URL}/cover_analysis/${bookId}`
            );
            setAnalysis(fullData.analysis || []);
            setFeedback(fullData.feedback || null);
        } catch (err) {
            console.error("[FETCH] Error during fetchAll()", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        checkTempCover();
    }, [bookId]);

    // UPLOAD COVER (auth required)
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("[UPLOAD] New file selected:", file.name);
        setLoading(true);
        setAnalysis(null);
        setFeedback(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            await authenticatedFetch(
                `${import.meta.env.VITE_API_URL}/upload_cover/${bookId}`,
                {
                    method: "POST",
                    body: formData,
                    headers: {} // Do not set Content-Type when using FormData!
                }
            );
            await fetchAll();
            await checkTempCover();
        } catch (err) {
            alert("Upload failed.");
            console.error("[UPLOAD ERROR]", err);
        } finally {
            setLoading(false);
        }
    };

    // MAKE COVER PERMANENT (auth required)
    const handleMakePermanent = async () => {
        try {
            await authenticatedFetch<any>(
                `${import.meta.env.VITE_API_URL}/make_cover_permanent/${bookId}`,
                { method: "POST" }
            );
            window.location.reload();
        } catch (err) {
            alert("Request failed.");
            console.error("[MAKE_PERMANENT] Error:", err);
        }
    };

    if (loading || !analysis || !feedback) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulseSlow">
                <p>Analyzing your cover...</p>
                <p>This may take a few seconds.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="md:w-[40%] w-full flex flex-col items-center gap-4">
                    <div
                        className="relative group rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <img
                            src={imagePath}
                            alt="Book cover"
                            className="w-auto h-full max-h-[600px] object-contain block rounded-2xl"
                            onLoad={() => {
                                console.log("[IMG] Loaded image for", isTemporaryCover ? "TEMP" : "FINAL");
                            }}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <p className="text-white text-sm font-semibold">Click to upload a new cover</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverUpload}
                        />
                    </div>

                    <button
                        onClick={handleMakePermanent}
                        className="mt-4 px-6 py-2 bg-[#FF1A1E] text-white rounded-lg font-medium hover:bg-[#bb0003] transition-colors"
                    >
                        Make this Cover Permanent
                    </button>
                </div>

                <div className="md:w-2/3 w-full space-y-6">
                    {analysis.map((item, i) => {
                        const borderColor = item.icon && emojiColorMap[item.icon] ? emojiColorMap[item.icon] : "border-[rgba(255,26,30,0.15)]";
                        return (
                            <div
                                key={i}
                                className={classNames(
                                    "rounded-lg border-l-4 p-4 bg-[rgba(255,26,30,0.05)] shadow-md transform transition-all duration-300 hover:scale-[1.05] hover:bg-[rgba(255,26,30,0.15)] opacity-0 animate-fadeIn",
                                    borderColor
                                )}
                                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {item.icon && <span className="text-xl">{item.icon}</span>}
                                    <h3 className="text-lg font-semibold text-[#BB0003]">{item.category}</h3>
                                </div>
                                <p className="text-black/70 text-md font-medium mb-1">"{item.title}"</p>
                                <p className="text-black/50">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card>
                <SectionTitle>Aesthetic Breakdown</SectionTitle>
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-sm">
                        <thead>
                            <tr>
                                <th className="text-left px-6 py-3 text-[#BB0003] uppercase tracking-wider text-xs">Element</th>
                                <th className="text-left px-6 py-3 text-[#BB0003] uppercase tracking-wider text-xs">What Works</th>
                                <th className="text-left px-6 py-3 text-[#BB0003] uppercase tracking-wider text-xs">What Could Be Better</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {feedback.aesthetic_breakdown.map((item, index) => (
                                <tr key={index} className="hover:bg-white/10 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-black">{item.element}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </span>
                                            <span className="text-black/70">{item.what_works}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                            </span>
                                            <span className="text-black/70">{item.what_could_be_better}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CoverAnalysisTab;
