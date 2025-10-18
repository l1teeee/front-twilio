import { FC, useEffect, useMemo, useState } from "react";
import { RefreshCw, MessageSquare, Clock, Activity, Download } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import { getMensajes, getSentimientos, getTemas } from "@/services/whatsapp";
import { Mensaje, SentimientosData, TemasData } from "@/types/api";
import { SENTIMENT_COLORS } from "@/constants/colors.ts";

const COLORS = SENTIMENT_COLORS;

const Home: FC = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [sentimientos, setSentimientos] = useState<SentimientosData>({ positivo: 0, negativo: 0, neutro: 0 });
  const [temas, setTemas] = useState<TemasData>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [m, s, t] = await Promise.all([
        getMensajes(),
        getSentimientos(),
        getTemas(),
      ]);
      setMensajes(m || []);
      setSentimientos(s || { positivo: 0, negativo: 0, neutro: 0 });
      setTemas(t || {});
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Mensajes detallados
      const mensajesData = mensajes.map((mensaje, index) => ({
        'N°': index + 1,
        'Fecha y Hora': new Date(mensaje.timestamp).toLocaleString("es-ES"),
        'Número Remitente': mensaje.numero_remitente,
        'Mensaje': mensaje.texto_mensaje,
        'Sentimiento': mensaje.sentimiento,
        'Tema': mensaje.tema,
        'Resumen IA': mensaje.resumen,
        'ID': mensaje._id
      }));

      const mensajesSheet = XLSX.utils.json_to_sheet(mensajesData);

      // Ajustar ancho de columnas
      const mensajesColWidths = [
        { wch: 5 },   // N°
        { wch: 20 },  // Fecha y Hora
        { wch: 15 },  // Número Remitente
        { wch: 50 },  // Mensaje
        { wch: 12 },  // Sentimiento
        { wch: 15 },  // Tema
        { wch: 60 },  // Resumen IA
        { wch: 25 }   // ID
      ];
      mensajesSheet['!cols'] = mensajesColWidths;

      XLSX.utils.book_append_sheet(workbook, mensajesSheet, "Mensajes");

      // Hoja 2: Resumen de sentimientos
      const sentimientosData = Object.entries(sentimientos).map(([sentimiento, cantidad]) => ({
        'Sentimiento': sentimiento.charAt(0).toUpperCase() + sentimiento.slice(1),
        'Cantidad': cantidad,
        'Porcentaje': ((cantidad / mensajes.length) * 100).toFixed(1) + '%'
      }));

      const sentimientosSheet = XLSX.utils.json_to_sheet(sentimientosData);
      sentimientosSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sentimientosSheet, "Sentimientos");

      // Hoja 3: Resumen de temas
      const temasData = Object.entries(temas)
          .sort(([,a], [,b]) => b - a)
          .map(([tema, cantidad], index) => ({
            'Posición': index + 1,
            'Tema': tema,
            'Cantidad': cantidad,
            'Porcentaje': ((cantidad / mensajes.length) * 100).toFixed(1) + '%'
          }));

      const temasSheet = XLSX.utils.json_to_sheet(temasData);
      temasSheet['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, temasSheet, "Temas");

      // Hoja 4: Estadísticas generales
      const estadisticasData = [
        { 'Métrica': 'Total de Mensajes', 'Valor': mensajes.length },
        { 'Métrica': 'Mensajes Positivos', 'Valor': sentimientos.positivo || 0 },
        { 'Métrica': 'Mensajes Negativos', 'Valor': sentimientos.negativo || 0 },
        { 'Métrica': 'Mensajes Neutros', 'Valor': sentimientos.neutro || 0 },
        { 'Métrica': 'Fecha de Exportación', 'Valor': new Date().toLocaleString("es-ES") },
        { 'Métrica': 'Última Actualización', 'Valor': lastUpdate.toLocaleString("es-ES") },
        { 'Métrica': 'Total de Temas Únicos', 'Valor': Object.keys(temas).length },
        { 'Métrica': 'Tema más Frecuente', 'Valor': Object.entries(temas).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A' }
      ];

      const estadisticasSheet = XLSX.utils.json_to_sheet(estadisticasData);
      estadisticasSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, estadisticasSheet, "Estadísticas");

      // Generar archivo y descargar
      const fechaHora = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const nombreArchivo = `WhatsApp_Analisis_${fechaHora}.xlsx`;

      XLSX.writeFile(workbook, nombreArchivo);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartSentimientos = useMemo(() => (
      Object.entries(sentimientos)
          .map(([key, value]) => ({
            name: key,
            value,
            fill: COLORS[key as keyof typeof COLORS],
          }))
          .filter((d) => d.value > 0)
  ), [sentimientos]);

  const chartTemas = useMemo(() => (
      Object.entries(temas)
          .map(([name, cantidad]) => ({ name, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)
  ), [temas]);

  const getSentimentPill = (sentimiento: string) => {
    switch (sentimiento) {
      case "positivo": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "negativo": return "bg-red-500/10 text-red-400 border-red-500/20";
      default:         return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

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
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Modal */}
          {showModal && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowModal(false)}
              >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="relative mx-4 max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                  <button
                      onClick={() => setShowModal(false)}
                      className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Registrar tu número</h2>
                    <p className="text-sm text-zinc-400">Sigue estos pasos para conectar tu WhatsApp</p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Envía un mensaje</h3>
                        <p className="text-sm text-zinc-400">
                          Usa WhatsApp y envía un mensaje desde tu dispositivo al número:
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-emerald-400">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-semibold">+1 415 523 8886</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Incluye el código</h3>
                        <p className="text-sm text-zinc-400">
                          En el mensaje escribe exactamente:
                        </p>
                        <div className="mt-2 font-mono bg-zinc-950 px-3 py-2 rounded border border-zinc-800 text-white">
                          join author-person
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Confirma el registro</h3>
                        <p className="text-sm text-zinc-400">
                          Recibirás un mensaje de confirmación y tu número quedará registrado para recibir análisis de IA.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <a
                        href="https://wa.me/14155238886?text=join%20author-person"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition-colors"
                        onClick={() => setShowModal(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Abrir WhatsApp ahora
                    </a>
                  </div>
                </motion.div>
              </motion.div>
          )}

          {/* Header */}
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">Dashboard WhatsApp</h1>
                <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-zinc-400">En vivo</span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                    onClick={exportToExcel}
                    disabled={isExporting || mensajes.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className={`h-4 w-4 ${isExporting ? "animate-bounce" : ""}`} />
                  {isExporting ? "Exportando..." : "Descargar Excel"}
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/20 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Registrar Número
                </button>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Clock className="h-4 w-4" />
                <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              {mensajes.length > 0 && (
                  <div className="text-sm text-zinc-500">
                    {mensajes.length} mensajes disponibles para exportar
                  </div>
              )}
            </div>
          </motion.div>

          {/* KPI Cards */}
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
              <p className="mt-2 text-3xl font-semibold">{mensajes.length}</p>
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

          {/* Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Sentimientos */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              <h3 className="mb-6 text-lg font-semibold">Distribución de Sentimientos</h3>
              <div className="h-80">
                {chartSentimientos.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={chartSentimientos}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            dataKey="value"
                            stroke="#18181b"
                            strokeWidth={2}
                        >
                          {chartSentimientos.map((entry, idx) => (
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

              {chartSentimientos.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-zinc-800 pt-6">
                    {chartSentimientos.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span className="text-sm capitalize text-zinc-300">{entry.name}</span>
                          <span className="text-sm font-semibold">({entry.value})</span>
                        </div>
                    ))}
                  </div>
              )}
            </motion.div>

            {/* Temas */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              <h3 className="mb-6 text-lg font-semibold">Frecuencia de Temas</h3>
              <div className="h-80">
                {chartTemas.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartTemas} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
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
          </div>

          {/* Feed */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-zinc-600">
            <p>Actualiza cada 30s automáticamente</p>
          </div>
        </div>
      </div>
  );
};

export default Home;