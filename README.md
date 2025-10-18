# Dashboard WhatsApp con Análisis de IA

Sistema de análisis en tiempo real para mensajes de WhatsApp que utiliza inteligencia artificial para clasificar sentimientos, identificar temas y generar resúmenes automáticos.

## Descripción

Este proyecto consiste en un dashboard web que procesa y analiza mensajes de WhatsApp recibidos a través de la API de Twilio. El sistema proporciona visualizaciones en tiempo real de los datos procesados y permite la exportación de resultados en múltiples formatos.

## Características Principales

### Análisis Automático
- Clasificación de sentimientos (positivo, negativo, neutro)
- Identificación automática de temas principales
- Generación de resúmenes inteligentes por mensaje
- Procesamiento en tiempo real

### Interfaz de Usuario
- Dashboard con métricas en tiempo real
- Gráficos interactivos para visualización de datos
- Actualización automática cada 30 segundos
- Diseño responsivo para dispositivos móviles y escritorio

### Exportación de Datos
- Exportación a formato CSV para análisis externos
- Exportación a formato JSON para integración con otras aplicaciones
- Organización de datos en archivos separados por categoría
- Metadatos y estadísticas generales incluidas

### Respuesta Automática
- Sistema de respuesta automática configurable
- Respuestas personalizadas por palabras clave
- Integración con Twilio Studio para flujos conversacionales
- Soporte para horarios de atención

## Tecnologías Utilizadas

**Frontend**
- React 18 con TypeScript
- Tailwind CSS para estilos
- Recharts para visualizaciones
- Framer Motion para animaciones
- Lucide React para iconografía

**Backend**
- API REST para comunicación con servicios externos
- Integración con Twilio WhatsApp API
- Procesamiento de webhooks para mensajes entrantes

**Herramientas de Desarrollo**
- Vite como bundler y servidor de desarrollo
- TypeScript para tipado estático
- ESLint para análisis de código

## Instalación

### Requisitos Previos
- Node.js versión 18 o superior
- npm o yarn como gestor de paquetes
- Cuenta activa de Twilio con WhatsApp API configurada

### Configuración del Proyecto

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd front-twilio
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno

El proyecto incluye un archivo de configuración global `.env` pre-configurado que apunta a la API de producción:

```
VITE_API_BASE_URL=https://api-twilio.onrender.com
```

Nota: La configuración está lista para usar sin modificaciones adicionales.

4. Iniciar servidor de desarrollo
```bash
npm run dev
```



## API Endpoints

### Obtener Mensajes
```
GET /api/mensajes
```
Retorna array de mensajes procesados con análisis completo.

### Obtener Análisis de Sentimientos
```
GET /api/sentimientos
```
Retorna objeto con contadores de sentimientos por categoría.

### Obtener Análisis de Temas
```
GET /api/temas
```
Retorna objeto con frecuencia de temas identificados.

## Uso del Sistema

### Dashboard Principal

El dashboard proporciona una vista general del sistema con las siguientes secciones:

**Métricas en Tiempo Real**
- Total de mensajes procesados
- Distribución de sentimientos por categoría
- Contadores individuales por tipo de sentimiento

**Visualizaciones**
- Gráfico circular para distribución de sentimientos
- Gráfico de barras para frecuencia de temas
- Timeline de mensajes recientes con detalles

**Funciones de Exportación**
- Botón de descarga para exportar todos los datos
- Generación automática de múltiples archivos
- Formatos CSV y JSON disponibles

### Exportación de Datos

El sistema genera los siguientes archivos al exportar:

1. `WhatsApp_Mensajes_[fecha].csv` - Datos detallados de todos los mensajes
2. `WhatsApp_Sentimientos_[fecha].csv` - Resumen de análisis de sentimientos
3. `WhatsApp_Temas_[fecha].csv` - Ranking de temas más frecuentes
4. `WhatsApp_Estadisticas_[fecha].json` - Métricas generales y metadatos

## Despliegue

### Construcción para Producción
```bash
npm run build
```

### Configuración de Variables de Entorno
Asegurar que las variables de entorno estén configuradas correctamente en la plataforma de despliegue.

### Verificación de Funcionamiento
1. Verificar conectividad con la API de backend
2. Confirmar recepción de webhooks de Twilio
3. Validar funcionamiento de respuestas automáticas
4. Probar exportación de datos