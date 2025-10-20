import { Calendar, Clock, User, RefreshCw } from "lucide-react";
import { Mensaje } from "@/types/api";
import {FC, useMemo} from "react";
import { motion } from "framer-motion";

interface TimelineProps {
    mensajes: Mensaje[];
    loading: boolean;
}

export const Timeline: FC<TimelineProps> = ({ mensajes, loading }) => {
    const timelineData = useMemo(() => {
        const mensajesOrdenados = [...mensajes].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const grouped = mensajesOrdenados.reduce((acc, mensaje) => {
            const fecha = new Date(mensaje.timestamp).toLocaleDateString("es-ES", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!acc[fecha]) {
                acc[fecha] = [];
            }
            acc[fecha].push(mensaje);
            return acc;
        }, {} as Record<string, Mensaje[]>);

        return Object.entries(grouped);
    }, [mensajes]);

    const getSentimentPill = (sentimiento: string) => {
        switch (sentimiento) {
            case "positivo": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "negativo": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    const getSentimentIcon = (sentimiento: string) => {
        switch (sentimiento) {
            case "positivo": return "😊";
            case "negativo": return "😞";
            default: return "😐";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900"
        >
            <div className="border-b border-zinc-800 p-6">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">Timeline de Mensajes</h3>
                </div>
                <p className="mt-1 text-sm text-zinc-500">Cronología completa de mensajes recibidos</p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {loading && mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-600">
                        <RefreshCw className="h-10 w-10 animate-spin" />
                        <p>Cargando timeline...</p>
                    </div>
                ) : timelineData.length > 0 ? (
                    <div className="p-6">
                        {timelineData.map(([fecha, mensajesDia], dayIndex) => (
                            <motion.div
                                key={fecha}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
                                className="relative"
                            >
                                <div className="sticky top-0 z-10 mb-4 flex items-center gap-3 bg-zinc-900 pb-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
                                        <Calendar className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white capitalize">{fecha}</h4>
                                        <p className="text-xs text-zinc-400">{mensajesDia.length} mensajes</p>
                                    </div>
                                </div>

                                <div className="ml-5 border-l-2 border-zinc-800 pl-6 pb-6">
                                    {mensajesDia.map((mensaje, msgIndex) => (
                                        <motion.div
                                            key={mensaje._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: (dayIndex * 0.1) + (msgIndex * 0.05) }}
                                            className="relative mb-6 last:mb-0"
                                        >
                                            <div className="absolute -left-8 top-3 h-3 w-3 rounded-full border-2 border-zinc-800 bg-zinc-900">
                                                <div className={`h-full w-full rounded-full ${
                                                    mensaje.sentimiento === 'positivo' ? 'bg-emerald-500' :
                                                        mensaje.sentimiento === 'negativo' ? 'bg-red-500' : 'bg-zinc-500'
                                                }`} />
                                            </div>

                                            <motion.div
                                                whileHover={{ scale: 1.01, backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                                                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-all duration-200"
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3 text-zinc-400" />
                                                            <span className="text-xs text-zinc-400">{mensaje.numero_remitente}</span>
                                                        </div>
                                                        <span className="text-lg">{getSentimentIcon(mensaje.sentimiento)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(mensaje.timestamp).toLocaleTimeString("es-ES", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-white leading-relaxed">"{mensaje.texto_mensaje}"</p>
                                                </div>

                                                <div className="mb-3 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSentimentPill(mensaje.sentimiento)}`}>
                            {mensaje.sentimiento}
                          </span>
                                                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                            {mensaje.tema}
                          </span>
                                                </div>

                                                <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-700">
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-500" />
                                                        <div>
                                                            <p className="text-xs font-medium text-purple-400 mb-1">Análisis IA</p>
                                                            <p className="text-sm text-zinc-300 leading-relaxed">{mensaje.resumen}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-zinc-600">
                        <Calendar className="mx-auto mb-4 h-14 w-14" />
                        <h4 className="mb-1 text-base font-medium text-zinc-400">No hay mensajes en la timeline</h4>
                        <p className="text-sm">Los mensajes aparecerán aquí organizados por fecha</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};