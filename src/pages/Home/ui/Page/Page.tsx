import { FC, useEffect, useState } from "react";
import { RefreshCw, MessageSquare, Clock, Activity, Download } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import { getMensajes, getSentimientos, getTemas } from "@/services/whatsapp";
import { Mensaje, SentimientosData, TemasData } from "@/types/api";

import { KPICards } from "@/componentes/KPICards";
import {SentimentChart} from "@/componentes/SentimentChart";
import {TopicsChart} from "@/componentes/TopicsChart";
import {Timeline} from "@/componentes/Timeline";
import {RecentMessages} from "@/componentes/RecentMessages";

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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      const workbook = XLSX.utils.book_new();

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
      const mensajesColWidths = [
        { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 50 },
        { wch: 12 }, { wch: 15 }, { wch: 60 }, { wch: 25 }
      ];
      mensajesSheet['!cols'] = mensajesColWidths;
      XLSX.utils.book_append_sheet(workbook, mensajesSheet, "Mensajes");

      const sentimientosData = Object.entries(sentimientos).map(([sentimiento, cantidad]) => ({
        'Sentimiento': sentimiento.charAt(0).toUpperCase() + sentimiento.slice(1),
        'Cantidad': cantidad,
        'Porcentaje': ((cantidad / mensajes.length) * 100).toFixed(1) + '%'
      }));

      const sentimientosSheet = XLSX.utils.json_to_sheet(sentimientosData);
      sentimientosSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sentimientosSheet, "Sentimientos");

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

      const estadisticasData = [
        { 'Métrica': 'Total de Mensajes', 'Valor': mensajes.length },
        { 'Métrica': 'Mensajes Positivos', 'Valor': sentimientos.positivo || 0 },
        { 'Métrica': 'Mensajes Negativos', 'Valor': sentimientos.negativo || 0 },
        { 'Métrica': 'Mensajes Neutros', 'Valor': sentimientos.neutro || 0 },
        { 'Métrica': 'Fecha de Exportación', 'Valor': new Date().toLocaleString("es-ES") },
        { 'Métrica': 'Última Actualización', 'Valor': lastUpdate.toLocaleString("es-ES") },
        { 'Métrica': 'Total de Temas Únicos', 'Valor': Object.keys(temas).length },
      ];

      const estadisticasSheet = XLSX.utils.json_to_sheet(estadisticasData);
      estadisticasSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, estadisticasSheet, "Estadísticas");

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

  return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
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

          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
          >
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-xl font-semibold sm:text-2xl">Dashboard WhatsApp</h1>
                <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm w-fit">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-zinc-400">En vivo</span>
                  <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                    onClick={exportToExcel}
                    disabled={isExporting || mensajes.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4"
                >
                  <Download className={`h-4 w-4 ${isExporting ? "animate-bounce" : ""}`} />
                  <span className="hidden xs:inline">{isExporting ? "Exportando..." : "Descargar Excel"}</span>
                  <span className="xs:hidden">{isExporting ? "..." : "Excel"}</span>
                </button>

                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/20 transition-colors sm:px-4"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden xs:inline">Registrar Número</span>
                  <span className="xs:hidden">Registrar</span>
                </button>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden xs:inline">Actualizar</span>
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

          <KPICards totalMensajes={mensajes.length} sentimientos={sentimientos} />

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SentimentChart sentimientos={sentimientos} />
            <TopicsChart temas={temas} />
          </div>

          <Timeline mensajes={mensajes} loading={loading} />
          <RecentMessages mensajes={mensajes} loading={loading} />

          <div className="mt-8 text-center text-xs text-zinc-600">
            <p>Actualiza cada 30s automáticamente</p>
          </div>
        </div>
      </div>
  );
};

export default Home;