import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { TemasData } from "@/types/api";
import {MessageSquare} from "lucide-react";
import { motion } from "framer-motion";
import {FC, useMemo} from "react";

interface TopicsChartProps {
    temas: TemasData;
}

export const TopicsChart: FC<TopicsChartProps> = ({ temas }) => {
    const chartData = useMemo(() => (
        Object.entries(temas)
            .map(([name, cantidad]) => ({ name, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
    ), [temas]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
                    <p className="font-semibold text-white mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-semibold text-white">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
        >
            <h3 className="mb-6 text-lg font-semibold">Frecuencia de Temas</h3>
            <div className="h-80">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: "#27272a" }}
                                tickLine={false}
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fill: "#71717a" }}
                            />
                            <YAxis
                                axisLine={{ stroke: "#27272a" }}
                                tickLine={false}
                                fontSize={12}
                                tick={{ fill: "#71717a" }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: "#a1a1aa" }} />
                            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center text-zinc-600">
                            <MessageSquare className="mx-auto mb-3 h-12 w-12" />
                            <p className="text-sm">Sin datos disponibles</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};