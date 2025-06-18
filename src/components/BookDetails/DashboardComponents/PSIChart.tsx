// frontend/src/components/BookDetails/DashboardComponents/PSIChart.tsx

import React from "react";

const psiColors: Record<string, string> = {
    readability_score: "#eb2f38",
    trendiness: "#e69138",
    minority_representation: "#3bb273",
    internationalization: "#008cba",
    transmedia_adaptability: "#7d3c98",
};

const psiFields = [
    {
        key: "readability_score",
        label: "Readability",
        tooltip:
            "Flesch Reading Ease (0–100): higher means easier. 60–70 is 'standard'.",
        circles: 10,
        color: psiColors.readability_score,
    },
    {
        key: "trendiness",
        label: "Trendiness",
        tooltip:
            "How much the book aligns with current literary and social trends.",
        circles: 10,
        color: psiColors.trendiness,
    },
    {
        key: "minority_representation",
        label: "Minority Rep.",
        tooltip:
            "How well the book features diverse, non-stereotyped characters.",
        circles: 10,
        color: psiColors.minority_representation,
    },
    {
        key: "internationalization",
        label: "Internationalization",
        tooltip:
            "Ease of translation and adaptation for international markets.",
        circles: 10,
        color: psiColors.internationalization,
    },
    {
        key: "transmedia_adaptability",
        label: "Transmedia Adapt.",
        tooltip:
            "How suitable the book is for adaptation to film, TV, games, etc.",
        circles: 10,
        color: psiColors.transmedia_adaptability,
    },
];

const formatScore = (val: any) =>
    typeof val === "number" ? Math.round(val * 10) / 10 : "--";

const interpretationColors: Record<string, string> = {
    Excellent: "#11b981",
    Good: "#eb2f38",
    Moderate: "#e69138",
    "Below Average": "#bdbdbd",
    Poor: "#a94442",
};

interface Subscore {
    score: number;
    confidence: number;
    explanation: string;
}
interface PSIResult {
    overall_score: number;
    confidence: number;
    readability_score: number;
    subscores: Record<string, Subscore>;
    interpretation?: {
        level: string;
        description: string;
        recommendation: string;
    };
}

interface PSIChartProps {
    psiData?: PSIResult;
}

const PSIChart: React.FC<PSIChartProps> = ({ psiData }) => {
    if (!psiData)
        return (
            <div className="p-8 bg-white rounded-2xl text-center">
                <span className="text-gray-400">No PSI data available for this book.</span>
            </div>
        );

    const { overall_score, confidence, readability_score, subscores, interpretation } = psiData;

    // Helper to get subscore by key (special for readability_score)
    const getSubscore = (key: string) => {
        if (key === "readability_score")
            return { score: readability_score, confidence: 1, explanation: "The Flesch Reading Ease score is a readability metric that measures how easy a text is to understand. Scores range from 0 (very difficult) to 100 (very easy). Higher scores mean simpler words and sentences, making the text more accessible to a wider audience, including younger readers." };
        return subscores?.[key] || { score: "--", confidence: 0, explanation: "" };
    };

    // For confidence bar visual
    const confidencePercent = Math.round((confidence || 0) * 100);

    return (
        <div className="space-y-6 w-full mx-auto">
            {/* Main Overview */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[rgba(250,147,153,0.08)] rounded-2xl shadow p-6 mb-3">
                <div className="flex flex-col gap-2 flex-grow">
                    <span className="text-lg font-semibold text-[#eb2f38]">
                        Potential Success Indicator (PSI)
                    </span>
                    <span className="flex items-center space-x-4">
                        <span className="text-4xl font-bold text-[#c9242d]">
                            {formatScore(overall_score)}/100
                        </span>
                        <span className="text-sm text-gray-500">
                            Confidence: {confidencePercent}%
                        </span>
                    </span>
                    {interpretation && (
                        <div className="mt-1">
                            <span
                                className="font-semibold"
                                style={{
                                    color:
                                        interpretationColors[interpretation.level] ||
                                        "#eb2f38",
                                }}
                            >
                                {interpretation.level}
                            </span>
                            <span className="ml-2 text-gray-700">
                                {interpretation.description}
                            </span>
                            <div className="text-sm italic text-gray-600">
                                {interpretation.recommendation}
                            </div>
                        </div>
                    )}
                    {/* Confidence bar */}
                    <div className="w-full max-w-xs mt-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-2 rounded-full"
                                style={{
                                    width: `${confidencePercent}%`,
                                    background: `linear-gradient(90deg, #eb2f38 60%, #3bb273 100%)`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscore Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {psiFields.map(
                    ({ key, label, tooltip, circles, color }) => {
                        const { score, confidence, explanation } = getSubscore(key);
                        const filled = typeof score === "number" ? Math.min(Math.round((score / 100) * circles), circles) : 0;

                        return (
                            <div
                                key={key}
                                className="relative bg-[rgba(250,147,153,0.05)] p-4 rounded-lg shadow-sm group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium" style={{ color }}>
                                        {label}
                                    </span>
                                    <div className="relative">
                                        <span className="font-bold cursor-pointer" style={{ color }}>
                                            ?
                                        </span>
                                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                                                w-52 bg-white text-xs text-gray-700 p-2 rounded shadow-lg
                                                opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                            {tooltip}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-2xl font-bold mt-1" style={{ color }}>
                                    {formatScore(score)}
                                </p>
                                <div className="flex space-x-1 mt-2">
                                    {Array.from({ length: circles }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-all duration-200`}
                                            style={{
                                                background: i < filled ? color : "transparent",
                                                border: i < filled ? "none" : "1px solid #d1d5db",
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Always show the explanation */}
                                <div 
                                    className="mt-3 bg-white border-l-4 border-[#eb2f38] rounded p-2 text-xs text-gray-700 shadow"
                                    style={{ borderLeftColor: color }}
                                >
                                    <span className="font-semibold block mb-1">
                                        {label} Analysis
                                    </span>
                                    <span>{explanation}</span>
                                    <div className="mt-2 text-right text-[10px] text-gray-400">
                                        Confidence: {(confidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};

export default PSIChart;