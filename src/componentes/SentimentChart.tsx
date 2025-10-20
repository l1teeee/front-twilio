import {FC, useMemo} from "react";
import { MessageSquare } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SENTIMENT_COLORS } from "@/constants/colors.ts";
import {SentimientosData} from "@/types/api.ts";
import { motion } from "framer-motion";

interface SentimentChartProps {
    sentimientos: SentimientosData;
}

export const SentimentChart: FC<SentimentChartProps> = ({ sentimientos }) => {
    const chartData = useMemo(() => (
        Object.entries(sentimientos)
            .map(([key, value]) => ({
                name: key,
                value,
                fill: SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS],
            }))
            .filter((d) => d.value > 0)
    ), [sentimientos]);

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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
        >
            <h3 className="mb-6 text-lg font-semibold">Distribución de Sentimientos</h3>
            <div className="h-80">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                dataKey="value"
                                stroke="#18181b"
                                strokeWidth={2}
                            >
                                {chartData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
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

            {chartData.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-zinc-800 pt-6">
                    {chartData.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                            <span className="text-sm capitalize text-zinc-300">{entry.name}</span>
                            <span className="text-sm font-semibold">({entry.value})</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};