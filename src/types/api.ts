export interface Mensaje {
    _id: string;
    texto_mensaje: string;
    numero_remitente: string;
    timestamp: string;
    sentimiento: 'positivo' | 'negativo' | 'neutro';
    tema: string;
    resumen: string;
}

export interface SentimientosData {
    positivo: number;
    negativo: number;
    neutro: number;
}

export interface TemasData {
    [key: string]: number;
}

class ApiService {
    private baseUrl = 'https://api-twilio.onrender.com';

    async getMensajes(): Promise<{ mensajes: Mensaje[]; total: number }> {
        const response = await fetch(`${this.baseUrl}/api/mensajes`);
        if (!response.ok) throw new Error('Error fetching mensajes');
        return response.json();
    }

    async getSentimientos(): Promise<SentimientosData> {
        const response = await fetch(`${this.baseUrl}/api/sentimientos`);
        if (!response.ok) throw new Error('Error fetching sentimientos');
        return response.json();
    }

    async getTemas(): Promise<TemasData> {
        const response = await fetch(`${this.baseUrl}/api/temas`);
        if (!response.ok) throw new Error('Error fetching temas');
        return response.json();
    }

    async getAllData() {
        const [mensajes, sentimientos, temas] = await Promise.all([
            this.getMensajes(),
            this.getSentimientos(),
            this.getTemas()
        ]);

        return { mensajes, sentimientos, temas };
    }
}

export const apiService = new ApiService();