import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid,
} from "recharts";

interface StyleInfluence {
    author: string;
    score: number;
    justification: string;
}

interface StyleDnaChartProps {
    title: string;
    data: StyleInfluence[];
    color?: string;
    progress: number;
}

const StyleDNAChart = ({ title, data, color = "#FF1A1E", progress }: StyleDnaChartProps) => {
    const chartData = data.map(item => ({
        author: item.author,
        value: item.score * progress,
        justification: item.justification,
    }));

    return (
        <div className="bg-white rounded-2xl p-6 space-y-6" style={{ fontFamily: '"bw gradual", sans-serif' }}>
            <h3 className="text-2xl font-semibold text-center text-[#BB0003]">{title}</h3>

            <div className="w-full" style={{ height: `${chartData.length * 40 + 100}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
                        barCategoryGap="10%"
                    >
                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fill: "black", fontFamily: '"bw gradual", sans-serif' }}
                            stroke="#BB0003"
                        />
                        <YAxis
                            type="category"
                            dataKey="author"
                            tick={{ fill: "black", fontFamily: '"bw gradual", sans-serif' }}
                            width={200}
                            stroke="#BB0003"
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(255,26,30,0.05)" }}
                            content={({ payload }) => {
                                if (!payload || !payload.length) return null;
                                const { author, justification } = payload[0].payload;
                                return (
                                    <div className="p-4 bg-white text-gray-800 border border-[#FF1A1E] rounded-md max-w-sm text-sm shadow">
                                        <p className="font-bold mb-2 text-[#BB0003]">{author}</p>
                                        <p>{justification}</p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]} animationDuration={600}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-4 transition-all duration-700 ease-out animate-fadeIn">
                <h4 className="text-xl font-semibold text-[#BB0003]">Notes</h4>
                {chartData.map(({ author, justification }, index) => (
                    <div
                        key={author}
                        className="border-l-4 border-[#FF1A1E] pl-4 opacity-0 animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                    >
                        <p className="font-medium text-[#FF1A1E]">{author}</p>
                        <p className="text-sm text-gray-700">{justification}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StyleDNAChart;
