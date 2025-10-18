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
