// frontend/src/components/BookDetails/MarketingTab.tsx

import React, { useEffect, useState } from 'react';
import { Copy, Twitter, Video } from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';

interface TikTokSegment {
    start: number;
    end: number;
    narration: string;
    visuals: string;
    sound: string;
}

interface TikTokScript {
    title: string;
    segments: TikTokSegment[];
    call_to_action: string;
}

interface MarketingData {
    ecommerce: {
        description: string[];
        bullets: string[];
        closing: string;
    };
    social: {
        twitter: { content: string; metrics: { likes: number; retweets: number } }[];
        instagram: { image: string; caption: string; metrics: { likes: number; comments: number } }[];
        tiktok: TikTokScript[];
    };
    visuals: string[];
}

interface Props {
    bookId: string;
}

const MarketingTab: React.FC<Props> = ({ bookId }) => {
    const [data, setData] = useState<MarketingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketing = async () => {
            try {
                const details = await authenticatedFetch<any>(
                    `${import.meta.env.VITE_API_URL}/books/${bookId}/details`
                );
                setData(details.marketing);
            } catch (err) {
                console.error("Failed to load marketing data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketing();
    }, [bookId]);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulseSlow">
                <p>Generating marketing content...</p>
                <p>This may take a few seconds.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-[#F9F6F6] p-6 rounded-2xl shadow-md space-y-6"
            style={{ fontFamily: '"bw gradual", sans-serif' }}
        >
            {/* E-Commerce */}
            <div className="bg-white rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[#BB0003]">E-commerce Content</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Copy className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4 text-gray-700">
                    {data.ecommerce.description.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                    <ul className="list-disc pl-6 space-y-2">
                        {data.ecommerce.bullets.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                    <p className="mt-4">{data.ecommerce.closing}</p>
                </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg p-6 shadow space-y-6">
                <h3 className="text-xl font-semibold text-[#BB0003]">Social Media Content</h3>

                {/* Twitter */}
                <div>
                    <h4 className="text-lg font-medium mb-3">Twitter Posts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.social.twitter.map((post, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                <div className="flex items-start space-x-3">
                                    <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                    <div>
                                        <p className="text-gray-800 text-sm">{post.content}</p>
                                        <div className="flex space-x-4 mt-2 text-gray-500 text-sm">
                                            <span>❤️ {post.metrics.likes}</span>
                                            <span>🔁 {post.metrics.retweets}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TikTok */}
                <div>
                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Video className="h-5 w-5 text-[#BB0003]" /> TikTok Script
                    </h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden p-4 shadow space-y-4">
                        <h5 className="text-lg font-semibold text-gray-800">
                            {data.social.tiktok[0]?.title ?? 'TikTok Video'}
                        </h5>
                        <div className="relative border-l-2 border-gray-300 pl-4 space-y-6">
                            {data.social.tiktok[0]?.segments?.map((seg, i) => (
                                <div
                                    key={i}
                                    className="relative group bg-white hover:bg-gray-100 transition rounded-md p-3 shadow-sm"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="absolute -left-2 top-2 h-3 w-3 bg-[#BB0003] border border-white rounded-full group-hover:scale-110 transition-transform" />
                                    <p className="text-sm text-gray-500 mb-1">
                                        ⏱ {seg.start}s – {seg.end}s
                                    </p>
                                    <p className="text-gray-800 font-medium mb-1">🎙 {seg.narration}</p>
                                    <p className="text-gray-600 italic">🎬 {seg.visuals}</p>
                                    <p className="text-gray-500 mt-1">🔊 {seg.sound}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center text-lg font-semibold text-[#BB0003]">
                            🎯 {data.social.tiktok[0]?.call_to_action}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingTab;
