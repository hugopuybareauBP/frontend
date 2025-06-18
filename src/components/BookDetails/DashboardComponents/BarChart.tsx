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

interface GenreBarChartProps {
    title?: string;
    data: Record<string, number>;
    color?: string;
    progress: number;
}

const GenreBarChart = ({ title, data, color = "#BB0003", progress }: GenreBarChartProps) => {
    const chartData = Object.entries(data).map(([genre, value]) => ({
        genre,
        value: value * progress,
    }));

    return (
        <div className="bg-white rounded-2xl p-6">
            {title && (
                <h3
                    className="text-2xl font-semibold text-center mb-6"
                    style={{ fontFamily: '"bw gradual", sans-serif', color: "#BB0003" }}
                >
                    {title}
                </h3>
            )}
            <div className="w-full" style={{ height: `${chartData.length * 40 + 100}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 50, bottom: 30 }}
                        barCategoryGap="20%"
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
                            dataKey="genre"
                            tick={{ fill: "black", fontFamily: '"bw gradual", sans-serif' }}
                            width={200}
                            stroke="#BB0003"
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(187, 0, 3, 0.05)" }}
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #BB0003",
                                borderRadius: "8px",
                                fontFamily: '"bw gradual", sans-serif',
                            }}
                            labelStyle={{ color: "#BB0003", fontWeight: "bold" }}
                            itemStyle={{ color: "#BB0003" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]} animationDuration={600}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GenreBarChart;
