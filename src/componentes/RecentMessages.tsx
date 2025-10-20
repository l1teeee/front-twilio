import {FC} from "react";
import {Mensaje} from "@/types/api.ts";
import { motion } from "framer-motion";
import {MessageSquare, RefreshCw} from "lucide-react";

interface RecentMessagesProps {
    mensajes: Mensaje[];
    loading: boolean;
}

export const RecentMessages: FC<RecentMessagesProps> = ({ mensajes, loading }) => {
    const getSentimentPill = (sentimiento: string) => {
        switch (sentimiento) {
            case "positivo": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "negativo": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-lg border border-zinc-800 bg-zinc-900"
        >
            <div className="border-b border-zinc-800 p-6">
                <h3 className="text-lg font-semibold">Mensajes Recientes</h3>
                <p className="mt-1 text-sm text-zinc-500">Últimos mensajes en tiempo real</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading && mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-600">
                        <RefreshCw className="h-10 w-10 animate-spin" />
                        <p>Cargando mensajes...</p>
                    </div>
                ) : mensajes.length > 0 ? (
                    <ul className="divide-y divide-zinc-800">
                        {mensajes.slice(0, 12).map((mensaje, index) => (
                            <motion.li
                                key={mensaje._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                                className="p-6 transition-colors"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSentimentPill(mensaje.sentimiento)}`}>
                      {mensaje.sentimiento}
                    </span>
                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                      {mensaje.tema}
                    </span>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {new Date(mensaje.timestamp).toLocaleString("es-ES", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="mb-1 text-sm font-medium text-zinc-400">De: {mensaje.numero_remitente}</p>
                                    <p className="text-white">"{mensaje.texto_mensaje}"</p>
                                </div>

                                <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                                    <p className="text-sm text-zinc-400">
                                        <strong className="text-zinc-300">Resumen IA:</strong> {mensaje.resumen}
                                    </p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="py-12 text-center text-zinc-600">
                        <MessageSquare className="mx-auto mb-4 h-14 w-14" />
                        <h4 className="mb-1 text-base font-medium text-zinc-400">No hay mensajes disponibles</h4>
                        <p className="text-sm">Los mensajes aparecerán aquí cuando lleguen por WhatsApp</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};