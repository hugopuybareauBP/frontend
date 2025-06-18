// frontend/src/components/BookDetails/DashboardComponents/ModerationChart.tsx

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

interface ModerationChartProps {
    data: ModerationPoint[];
}

const categoryColors: Record<string, string> = {
    Hate: "#99171D",
    SelfHarm: "#330000",
    Sexual: "#806659",
    Violence: "#FF1A1E",
};

const severityLabels: Record<number, string> = {
    0: "None",
    1: "Very low",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Very high",
    6: "Extreme",
    7: "Max",
};

const allCategories = Object.keys(categoryColors);

const ModerationChart: React.FC<ModerationChartProps> = ({ data }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(allCategories);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const chartData = data.map((point, i) => ({
        chunk_index: point.chunk_index,
        progress: Math.round((i / (data.length - 1)) * 100),
        ...point.scores,
    }));

    const CustomYAxisTick = ({ x, y, payload }: any) => {
        const value = Math.round(payload.value);
        const label = severityLabels[value] ?? value;
        return (
            <text
                x={x}
                y={y}
                dy={4}
                fill="black"
                fontSize={12}
                textAnchor="end"
                fontFamily='"bw gradual", sans-serif'
            >
                {label}
            </text>
        );
    };

    useEffect(() => {
        console.log("🚨 Raw moderation data:", data);
        console.log("📊 Flattened chartData:", chartData);
    }, [data]);

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 font-medium">No moderation data available.</p>;
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: '"bw gradual", sans-serif', color: "#BB0003" }}>
                Moderation Timeline
            </h3>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCategories.includes(cat)
                                ? 'bg-red-900 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoryColors[cat] }}
                        />
                        <span>{cat}</span>
                    </button>
                ))}
            </div>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
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
                            domain={[0, 7]}
                            ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                            tick={CustomYAxisTick}
                            stroke="#BB0003"
                        />
                        <Tooltip
                            cursor={{ stroke: "#BB0003", strokeWidth: 1 }}
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #BB0003",
                                borderRadius: "8px",
                                fontFamily: '"bw gradual", sans-serif',
                                color: "#111827",
                            }}
                            labelStyle={{ color: "#BB0003", fontWeight: "bold" }}
                            formatter={(value: any, name: any) => [value, name]}
                        />
                        {selectedCategories.map((category) => (
                            <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={categoryColors[category]}
                                strokeWidth={2}
                                dot={{ fill: categoryColors[category], r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6, stroke: categoryColors[category], strokeWidth: 2 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ModerationChart;