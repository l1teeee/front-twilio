import { FC } from "react";
import { motion } from "framer-motion";
import { SentimientosData } from "@/types/api";

interface KPICardsProps {
    totalMensajes: number;
    sentimientos: SentimientosData;
}

export const KPICards: FC<KPICardsProps> = ({ totalMensajes, sentimientos }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
            >
                <p className="text-sm font-medium text-zinc-400">Total mensajes</p>
                <p className="mt-2 text-3xl font-semibold">{totalMensajes}</p>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-lg border border-emerald-900/30 bg-emerald-950/20 p-5"
            >
                <p className="text-sm font-medium text-emerald-400">Positivos</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-400">{sentimientos.positivo || 0}</p>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-lg border border-red-900/30 bg-red-950/20 p-5"
            >
                <p className="text-sm font-medium text-red-400">Negativos</p>
                <p className="mt-2 text-3xl font-semibold text-red-400">{sentimientos.negativo || 0}</p>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
            >
                <p className="text-sm font-medium text-zinc-400">Neutros</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-400">{sentimientos.neutro || 0}</p>
            </motion.div>
        </motion.div>
    );
};