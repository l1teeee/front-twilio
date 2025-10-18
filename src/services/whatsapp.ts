import { Mensaje, SentimientosData, TemasData } from "@/types/api.ts";

const API_BASE_URL =
    (import.meta as any)?.env?.VITE_API_BASE_URL || "https://api-twilio.onrender.com";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
}

export async function getMensajes(): Promise<Mensaje[]> {
    const data = await fetchJSON<any>("/api/mensajes");
    return Array.isArray(data) ? data : data.mensajes ?? [];
}

export async function getSentimientos(): Promise<SentimientosData> {
    const data = await fetchJSON<SentimientosData>("/api/sentimientos");
    return data ?? { positivo: 0, negativo: 0, neutro: 0 };
}

export async function getTemas(): Promise<TemasData> {
    const data = await fetchJSON<TemasData>("/api/temas");
    return data ?? {};
}
