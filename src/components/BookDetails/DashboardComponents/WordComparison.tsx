import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Legend,
    Cell,
    ResponsiveContainer as PieContainer,
} from "recharts";

interface WordComparisonProps {
    wordDistribution: Record<string, number>;
}

const WORD_TYPES = ["Nouns", "Verbs", "Adjectives", "Adverbs", "Pronouns", "Other"] as const;

const COLORS = ["#FF787A", "#806659", "#000000", "#330000", "#99171D", "#FF1A1E"];

const AVERAGE_VALUES: Record<string, number> = {
    Nouns: 34,
    Verbs: 16,
    Adjectives: 9,
    Adverbs: 6,
    Pronouns: 8,
    Other: 27,
};

const BESTSELLER_VALUES: Record<string, number> = {
    Nouns: 35,
    Verbs: 19,
    Adjectives: 12,
    Adverbs: 9,
    Pronouns: 11,
    Other: 23,
};

const WordComparison: React.FC<WordComparisonProps> = ({ wordDistribution }) => {
    const barData = WORD_TYPES.map((type) => ({
        type,
        Average: AVERAGE_VALUES[type],
        Bestseller: BESTSELLER_VALUES[type],
        Manuscript: wordDistribution[type] ?? 0,
    }));

    const donutData = Object.entries(wordDistribution).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="bg-white rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-center mb-6" style={{ fontFamily: '"bw gradual", sans-serif', color: "#BB0003" }}>
                Word type usage comparison
            </h3>

            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
                {/* Bar Chart */}
                <div className="flex-1 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="type" tick={{ fill: "black", fontFamily: '"bw gradual", sans-serif' }} stroke="#BB0003" />
                            <YAxis tick={{ fill: "black", fontFamily: '"bw gradual", sans-serif' }} stroke="#BB0003" />
                            <Tooltip
                                cursor={{ fill: "rgba(255,26,30,0.05)" }}
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #FF1A1E",
                                    borderRadius: "8px",
                                    fontFamily: '"bw gradual", sans-serif',
                                    color: "#111827",
                                }}
                                labelStyle={{ color: "#BB0003", fontWeight: "bold" }}
                                formatter={(value: any, name: any) => [`${value}%`, name]}
                            />
                            <Bar dataKey="Average" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Bestseller" fill="#828385" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Manuscript" fill="#4e4f4f" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="relative mt-4 flex items-center space-x-2 group bottom-5">
                        <div className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-bold cursor-default">
                            i
                        </div>
                        <div className="absolute left-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded-md px-3 py-2 max-w-sm z-10 shadow-lg">
                            The distribution of parts of speech can vary widely within a genre based on the author's style, the work's purpose, and the target audience.
                        </div>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="w-full lg:w-1/3 h-[300px]">
                    <PieContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={donutData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                innerRadius={30}
                                paddingAngle={3}
                                label
                            >
                                {donutData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </PieContainer>
                </div>
            </div>
        </div>
    );
};

export default WordComparison;
