// frontend/src/components/BookDetails/AnalysisTab.tsx

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';

interface Chapter {
    chapter_name: string;
    raw_output: string;
    suggested_title: string;
}

interface Character {
    character_name: string;
    description: string;
}

interface Location {
    location_name: string;
    description: string;
}

interface AnalysisData {
    synopsis: string;
    impact: {
        strengths: string[];
        weaknesses: string[];
    };
    characters: Character[];
    chapters: Chapter[];
    locations: Location[];
}

interface Props {
    bookId: string;
}

const AnalysisTab: React.FC<Props> = ({ bookId }) => {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const details = await authenticatedFetch<any>(
                    `${import.meta.env.VITE_API_URL}/books/${bookId}/details`
                );
                setData(details.analysis);
            } catch (err) {
                console.error("Failed to load analysis", err);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchAnalysis();
    }, [bookId]);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulseSlow">
                <p>Generating detailed analysis...</p>
                <p>This may take a few seconds.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-[#F9F6F6] p-6 rounded-2xl shadow-md space-y-6"
            style={{ fontFamily: '"bw gradual", sans-serif' }}
        >
            {/* Synopsis */}
            {data.synopsis && (
                <div className="bg-white rounded-lg p-6 shadow">
                    <h3 className="text-xl font-semibold mb-4 text-[#BB0003]">Synopsis</h3>
                    <p className="text-gray-700">{data.synopsis}</p>
                </div>
            )}

            {/* Critical Analysis */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-4 text-[#BB0003]">Critical Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center mb-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                            <h4 className="text-lg font-medium">Strengths</h4>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            {data.impact.strengths.map((point, idx) => (
                                <li key={idx}>• {point}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className="flex items-center mb-3">
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            <h4 className="text-lg font-medium">Areas for Improvement</h4>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            {data.impact.weaknesses.map((point, idx) => (
                                <li key={idx}>• {point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Chapters */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-4 text-[#BB0003]">Chapter Breakdown</h3>
                <ul className="space-y-4">
                    {data.chapters.map((chapter, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <span className="w-8 h-8 bg-[#FF1A1E]/10 text-[#BB0003] font-bold rounded-full flex items-center justify-center">
                                {index + 1}
                            </span>
                            <div>
                                <h4 className="font-medium text-black">
                                    {chapter.suggested_title || chapter.chapter_name}
                                </h4>
                                <p className="text-gray-700 text-sm mt-1">{chapter.raw_output}</p>
                            </div>
                        </div>
                    ))}
                </ul>
            </div>

            {/* Characters */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-4 text-[#BB0003]">🔍 Character Profiles</h3>
                <ul className="space-y-4">
                    {data.characters.map((character, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium mb-2 text-black">{character.character_name}</h4>
                            <p className="text-gray-700">{character.description}</p>
                        </div>
                    ))}
                </ul>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-4 text-[#BB0003]">📍 Location Notes</h3>
                <ul className="space-y-4">
                    {data.locations.map((location, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium mb-2 text-black">{location.location_name}</h4>
                            <p className="text-gray-700">{location.description}</p>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AnalysisTab;
