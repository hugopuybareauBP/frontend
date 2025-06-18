// frontend/src/components/BookDetails/DashboardComponents/EmotionChart.tsx

import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

interface EmotionPoint {
    chunk_index: number;
    scores: {
        Joy: number;
        Sadness: number;
        Anger: number;
        Fear: number;
        Surprise: number;
        Disgust: number;
        Neutral: number;
    };
    text_stats: {
        readability_score: number;
        grade_level: number;
        avg_sentence_length: number;
        avg_syllables_per_word: number;
        sentence_count: number;
        word_count: number;
        difficult_words: number;
    };
}

interface EmotionDashboardProps {
    data: EmotionPoint[];
}

const emotionColors: Record<string, string> = {
    Joy: "#fa9399",
    Neutral: "#7b7d81", 
    Surprise: "#f2020e",
    Fear: "#9c0c14",
    Sadness: "#750c11",
    Disgust: "#400609",
    Anger: "#140203"
};

const intensityLabels: Record<number, string> = {
    0: "None",
    0.1: "Very Low",
    0.2: "Low",
    0.3: "Low-Moderate",
    0.4: "Moderate",
    0.5: "Moderate-High",
    0.6: "High",
    0.7: "Very High",
    0.8: "Intense",
    0.9: "Extreme",
    1.0: "Maximum"
};

const EmotionChart: React.FC<EmotionDashboardProps> = ({ data }) => {
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
        'Joy'
    ]);

    const chartData = data.map((point, i) => ({
        chunk_index: point.chunk_index,
        progress: Math.round((i / Math.max(data.length - 1, 1)) * 100),
        ...point.scores
    }));

    const avgTextStats = data.length > 0 ? {
        readability_score: data.reduce((sum, p) => sum + p.text_stats.readability_score, 0) / data.length,
        grade_level: data.reduce((sum, p) => sum + p.text_stats.grade_level, 0) / data.length,
        avg_sentence_length: data.reduce((sum, p) => sum + p.text_stats.avg_sentence_length, 0) / data.length,
        avg_syllables_per_word: data.reduce((sum, p) => sum + p.text_stats.avg_syllables_per_word, 0) / data.length,
        total_word_count: data.reduce((sum, p) => sum + p.text_stats.word_count, 0),
        difficult_words_ratio: data.reduce((sum, p) => sum + p.text_stats.difficult_words, 0) /
            data.reduce((sum, p) => sum + p.text_stats.word_count, 1)
    } : null;

    const textStatsData = avgTextStats ? [
        { metric: 'Readability Score', value: Math.round(avgTextStats.readability_score * 10) / 10, color: '#3B82F6' },
        { metric: 'Grade Level', value: Math.round(avgTextStats.grade_level * 10) / 10, color: '#8B5CF6' },
        { metric: 'Avg Sentence Length', value: Math.round(avgTextStats.avg_sentence_length * 10) / 10, color: '#10B981' },
        { metric: 'Avg Syllables/Word', value: Math.round(avgTextStats.avg_syllables_per_word * 10) / 10, color: '#F59E0B' },
        { metric: 'Difficult Words %', value: Math.round(avgTextStats.difficult_words_ratio * 1000) / 10, color: '#EF4444' }
    ] : [];

    const CustomYAxisTick = ({ x, y, payload }: any) => {
        const rounded = Math.round(payload.value * 10) / 10;
        const label = intensityLabels.hasOwnProperty(rounded)
            ? intensityLabels[rounded]
            : rounded;
        return (
            <text
                x={x}
                y={y}
                dy={4}
                fill="#374151"
                fontSize={11}
                textAnchor="end"
                fontFamily="Inter, sans-serif"
            >
                {label}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = chartData.find(d => d.progress === label);
            return (
                <div className="bg-white p-4 border border-[#FF1A1E] rounded-lg shadow-lg max-w-xs">
                    <p className="font-semibold text-[#BB0003] mb-2">
                        Progress: {label}%
                    </p>
                    {dataPoint && (
                        <p className="text-xs text-gray-600 mb-2 italic">
                        </p>
                    )}
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: entry.color }}>
                                {entry.dataKey}:
                            </span>
                            <span className="text-sm font-medium ml-2">
                                {Math.round(entry.value * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const toggleMetric = (metric: string) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    useEffect(() => {
        console.log("🎭 Emotion analysis data:", data);
        console.log("📊 Chart data:", chartData);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-gray-500 font-medium">No emotion data available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Emotion Chart */}
            <div>
                <h3 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: '"bw gradual", sans-serif', color: "#BB0003" }}>
                    Emotional Journey Throughout the Manuscript
                </h3>

                {/* Emotion Toggle Controls */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {Object.entries(emotionColors).map(([emotion, color]) => (
                        <button
                            key={emotion}
                            onClick={() => toggleMetric(emotion)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${selectedMetrics.includes(emotion)
                                ? 'bg-red-900 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span>{emotion}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="progress"
                                tick={{ fill: "#374151", fontSize: 12 }}
                                label={{
                                    value: "Book Progression (%)",
                                    position: "insideBottom",
                                    offset: -15,
                                    fill: "#374151",
                                    fontWeight: 600
                                }}
                                stroke="#BB0003"
                            />
                            <YAxis
                                domain={[0, 1]}
                                ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                                tick={CustomYAxisTick}
                                stroke="#BB0003"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {selectedMetrics.map((emotion) => (
                                <Line
                                    key={emotion}
                                    type="monotone"
                                    dataKey={emotion}
                                    stroke={emotionColors[emotion]}
                                    strokeWidth={2}
                                    dot={{ fill: emotionColors[emotion], strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: emotionColors[emotion], strokeWidth: 2 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Text Statistics */}
            <div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {avgTextStats &&
                        [
                            {
                                key: "readability",
                                label: "Readability Score",
                                value: Math.round(avgTextStats.readability_score * 10) / 10,
                                tooltip:
                                    "Flesch Reading Ease (0–100): higher means easier. 60–70 is “standard”.",
                                circles: 10,
                                active: Math.min(
                                    Math.round((avgTextStats.readability_score / 100) * 10),
                                    10
                                ),
                            },
                            {
                                key: "grade",
                                label: "Grade Level",
                                value: Math.round(avgTextStats.grade_level * 10) / 10,
                                tooltip:
                                    "U.S. school grade required to understand the text. Lower = simpler.",
                                circles: 12,
                                active: Math.min(Math.round(avgTextStats.grade_level), 12),
                            },
                            {
                                key: "sentenceLen",
                                label: "Avg Sentence Length",
                                value: Math.round(avgTextStats.avg_sentence_length * 10) / 10,
                                tooltip:
                                    "Average number of words per sentence. Higher = more complex sentences.",
                                circles: 10,
                                active: Math.min(Math.round(avgTextStats.avg_sentence_length), 10),
                            },
                            {
                                key: "syllables",
                                label: "Avg Syllables/Word",
                                value: Math.round(avgTextStats.avg_syllables_per_word * 10) / 10,
                                tooltip:
                                    "Average syllables per word. Higher = more complex vocabulary.",
                                circles: 5,
                                active: Math.min(
                                    Math.round(avgTextStats.avg_syllables_per_word),
                                    5
                                ),
                            },
                            {
                                key: "difficult",
                                label: "Difficult Words %",
                                value:
                                    Math.round(avgTextStats.difficult_words_ratio * 1000) / 10,
                                tooltip:
                                    "Percentage of words considered “difficult.” Higher = harder to read.",
                                circles: 10,
                                active: Math.min(
                                    Math.round(avgTextStats.difficult_words_ratio * 10),
                                    10
                                ),
                            },
                        ].map(
                            ({
                                key,
                                label,
                                value,
                                tooltip,
                                circles,
                                active,
                            }) => (
                                <div
                                    key={key}
                                    className="relative bg-[rgba(250,147,153,0.05)] p-4 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-[#eb2f38]">
                                            {label}
                                        </p>
                                        <div className="relative group">
                                            <span className="text-[#eb2f38] font-bold cursor-pointer">
                                                ?
                                            </span>
                                            <div
                                                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                                                            w-48 bg-white text-xs text-gray-700 p-2 rounded shadow-lg
                                                            opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {tooltip}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-2xl font-bold text-[#c9242d] mt-1">
                                        {value}
                                    </p>

                                    <div className="flex space-x-1 mt-2">
                                        {Array.from({ length: circles }).map((_, i) => (
                                            <span
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${i < active
                                                        ? "bg-[#eb2f38]"
                                                        : "border border-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                </div>
            </div>
        </div>
    );
};

export default EmotionChart;
