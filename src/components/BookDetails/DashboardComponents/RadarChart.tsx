import Plot from "react-plotly.js";

interface RadarChartProps {
    title: string;
    data: Record<string, number>;
    color: string;
    progress: number;
}

const RadarChart = ({ title, data, color, progress }: RadarChartProps) => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const animatedValues = values.map(v => v * progress);

    const closedValues = [...animatedValues, animatedValues[0]];
    const closedLabels = [...labels, labels[0]];

    return (
        <div className="bg-white rounded-2xl p-6 transition-all duration-300">
            <h3
                className="text-2xl font-semibold text-center mb-6"
                style={{ fontFamily: '"bw gradual", sans-serif', color: '#BB0003' }}
            >
                {title}
            </h3>
            <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                    <Plot
                        data={[
                            {
                                type: "scatterpolar",
                                r: closedValues,
                                theta: closedLabels,
                                fill: "toself",
                                mode: "lines+markers",
                                line: { color, width: 3 },
                                marker: { color, size: 6 },
                                fillcolor: `${color}33`,
                            },
                        ]}
                        layout={{
                            font: {
                                family: '"bw gradual", sans-serif',
                                color: "#000",
                            },
                            polar: {
                                bgcolor: "transparent",
                                radialaxis: {
                                    visible: true,
                                    range: [0, 100],
                                    gridcolor: "#E5E7EB",
                                    linecolor: "#D1D5DB",
                                    tickfont: { color: "#6B7280" },
                                },
                                angularaxis: {
                                    tickfont: { color: "#6B7280" },
                                    gridcolor: "#E5E7EB",
                                },
                            },
                            showlegend: false,
                            paper_bgcolor: "transparent",
                            plot_bgcolor: "transparent",
                            margin: { t: 30, l: 30, r: 30, b: 30 },
                        }}
                        style={{ width: "100%", height: "450px" }}
                        config={{ displayModeBar: false }}
                    />
                </div>
            </div>
        </div>
    );
    
};

export default RadarChart;
