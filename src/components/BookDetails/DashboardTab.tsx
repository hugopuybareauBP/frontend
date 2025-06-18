import { useEffect, useState, useMemo } from 'react';
import RadarChart from './DashboardComponents/RadarChart.tsx';
import GenreBarChart from "./DashboardComponents/BarChart.tsx";
import StyleDNAChart from './DashboardComponents/StyleDNAChart.tsx';
import WordComparison from "./DashboardComponents/WordComparison";
import ModerationChart from './DashboardComponents/ModerationChart.tsx';
import EmotionChart from "./DashboardComponents/EmotionChart.tsx";
import PSIChart from './DashboardComponents/PSIChart.tsx';
import { authenticatedFetch } from '../../utils/api';

type ChartType = "genre" | "tone" | "atmosphere";

interface DashboardTabProps {
    bookId: string;
}

interface StyleInfluence {
    author: string;
    score: number;
    justification: string;
}

interface ChartData {
    target_reader: Record<string, number>;
    genre: Record<string, number>;
    style_dna: StyleInfluence[];
}

interface ModerationPoint {
    chunk_index: number;
    text_preview: string;
    scores: {
        Hate: number;
        SelfHarm: number;
        Sexual: number;
        Violence: number;
    };
}

interface EmotionPoint {
    chunk_index: number;
    text_preview: string;
    scores: {
        Joy: number;
        Sadness: number;
        Anger: number;
        Fear: number;
        Surprise: number;
        Disgust: number;
        Trust: number;
        Anticipation: number;
    };
    text_stats: {
        readability_score: number;
        grade_level: number;
        avg_sentence_length: number;
        avg_syllables_per_word: number;
        sentence_count: number;
        word_count: number;
        difficult_words: number;
        reading_time_minutes: number;
    };
}

const DashboardTab = ({ bookId }: DashboardTabProps) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [chartValues, setChartValues] = useState<Record<string, number> | null>(null);
    const [chartType, setChartType] = useState<ChartType>('genre');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [animationFrame, setAnimationFrame] = useState<number>(0);
    const [wordDistribution, setWordDistribution] = useState<Record<string, number> | null>(null);
    const [moderationData, setModerationData] = useState<ModerationPoint[] | null>(null);
    const [emotionData, setEmotionData] = useState<EmotionPoint[] | null>(null);

    // PSI section
    const [psi, setPsi] = useState<any>(null);
    const [psiLoading, setPsiLoading] = useState(true);
    const [psiError, setPsiError] = useState<string | null>(null);

    // Fetch main dashboard data (except PSI)
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [
                    chartData,
                    wordData,
                    moderation,
                    emotions,
                ] = await Promise.all([
                    authenticatedFetch<any>(`${import.meta.env.VITE_API_URL}/dashboard/chart/${bookId}`),
                    authenticatedFetch<any>(`${import.meta.env.VITE_API_URL}/dashboard/word-distribution/${bookId}`),
                    authenticatedFetch<any>(`${import.meta.env.VITE_API_URL}/dashboard/moderation/${bookId}`),
                    authenticatedFetch<any>(`${import.meta.env.VITE_API_URL}/dashboard/emotions/${bookId}`),
                ]);
                setChartData(chartData);
                setChartValues(chartData.genre);
                setWordDistribution(wordData.word_distribution);

                const transformed = moderation.moderation.chunk_results.map((entry: any) => ({
                    chunk_index: entry.chunk_index,
                    text_preview: entry.text_preview,
                    scores: entry.scores,
                }));
                setModerationData(transformed);
                setEmotionData(emotions?.emotions ?? null);
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [bookId]);

    // Compute average readability from emotionData
    const avgReadability = useMemo(() => {
        if (!emotionData || emotionData.length === 0) return null;
        return (
            emotionData.reduce((sum, p) => sum + (p.text_stats.readability_score || 0), 0) /
            emotionData.length
        );
    }, [emotionData]);

    // Fetch PSI only when avgReadability is ready
    useEffect(() => {
        if (!avgReadability || !bookId) return;
        const fetchPsi = async () => {
            setPsiLoading(true);
            setPsiError(null);
            try {
                const psiRes = await authenticatedFetch<any>(
                    `${import.meta.env.VITE_API_URL}/dashboard/psi/${bookId}?readability_score=${avgReadability}`
                );
                setPsi(psiRes.psi);
            } catch (err: any) {
                setPsiError("Failed to load Potential Success Indicator.");
            } finally {
                setPsiLoading(false);
            }
        };
        fetchPsi();
    }, [bookId, avgReadability]);

    // Animation effect for progress charts
    useEffect(() => {
        if (!chartData) return;
        let frame = 0;
        const totalFrames = 1000;
        const interval = setInterval(() => {
            frame++;
            setAnimationFrame(frame);
            if (frame >= totalFrames) clearInterval(interval);
        }, 40);
        return () => clearInterval(interval);
    }, [chartData]);

    const handleChartChange = async (type: ChartType) => {
        setChartType(type);
        setLoading(true);
        try {
            const data = await authenticatedFetch<any>(
                `${import.meta.env.VITE_API_URL}/dashboard/chart/${bookId}?chart_type=${type}`
            );
            setChartValues(data[type]);
        } catch (err: any) {
            console.error("Error fetching chart:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !chartData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulseSlow">
                <p>Generating dashboards...</p>
                <p>This may take a few seconds.</p>
            </div>
        );
    }

    if (error || !chartData || !chartValues) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-600 font-medium">Failed to load dashboard visualization.</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F9F6F6] rounded-2xl p-6 space-y-10 animate-fadeIn" style={{ fontFamily: '"bw gradual", sans-serif' }}>
            <div className="bg-white rounded-xl shadow p-6">
                <RadarChart
                    title="Target Reader Segmentation"
                    data={chartData.target_reader}
                    color="#FF1A1E"
                    progress={Math.min(animationFrame / 30, 1)}
                />
            </div>

            {/* Unified Chart Section with Selector and Graph */}
            <div className="bg-white rounded-xl shadow p-6 space-y-6">
                <h3 className="text-2xl font-semibold text-[#BB0003] text-center">
                    {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Classification
                </h3>

                <div className="flex justify-center space-x-3">
                    {(["genre", "tone", "atmosphere"] as ChartType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => handleChartChange(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${chartType === type
                                    ? "bg-gradient-to-r from-[#FF1A1E] to-[#BB0003] text-white border-none"
                                    : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800"
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <GenreBarChart
                    data={chartValues}
                    color={chartType === "tone" ? "#FF1A1E" : chartType === "atmosphere" ? "#FF787A" : "#99171D"}
                    progress={Math.min(animationFrame / 30, 1)}
                />
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <StyleDNAChart
                    title="Author's DNA Breakdown"
                    data={chartData.style_dna}
                    progress={Math.min(animationFrame / 30, 1)}
                />
            </div>

            {wordDistribution && (
                <div className="bg-white rounded-xl shadow p-6">
                    <WordComparison wordDistribution={wordDistribution} />
                </div>
            )}

            {emotionData && (
                <div className="bg-white rounded-xl shadow p-6">
                    <EmotionChart data={emotionData} />
                </div>
            )}

            {moderationData && (
                <div className="bg-white rounded-xl shadow p-6">
                    <ModerationChart data={moderationData} />
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6">
                {psiLoading ? (
                    <div className="text-gray-600 text-center py-8">Analyzing Potential Success Indicator...</div>
                ) : psiError ? (
                    <div className="text-red-600 text-center py-8">{psiError}</div>
                ) : psi ? (
                    <PSIChart psiData={psi} />
                ) : null}
            </div>
        </div>
    );
};

export default DashboardTab;
