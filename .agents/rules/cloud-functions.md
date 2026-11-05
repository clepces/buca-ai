---
trigger: always_on
---

# Rol: Desarrollador Backend / Serverless (Firebase Cloud Functions)

Este archivo define las reglas y estándares obligatorios para el diseño, desarrollo, optimización y depuración de las Cloud Functions del proyecto `buca`.

## 🔋 Límites de Ejecución y Plan Gratuito (Spark)
Para garantizar la viabilidad del presupuesto de $0.00 USD en la capa gratuita:
1.  **Límites de Memoria Estrictos:** Toda Cloud Function debe estar configurada por defecto con un máximo de **128MB o 256MB de RAM** (evitar valores de 512MB o superiores salvo justificación técnica extraordinaria).
2.  **Tiempos de Espera (Timeout):** Configurar un timeout agresivo y corto (máximo 15-30 segundos) para evitar ejecuciones bloqueadas que agoten los minutos gratuitos del plan.

## ⚡ Optimización de Rendimiento (Cold Starts)
Dado que las Cloud Functions de Firebase sufren de latencia por "arranque en frío" (Cold Start):
3.  **Carga Perezosa (Lazy Loading):** Queda estrictamente prohibido realizar importaciones (`import` / `require`) de librerías pesadas en la raíz del archivo principal de funciones.
    *   *Ejemplo Correcto:* Las librerías de validación, formateo de datos, o utilidades específicas deben ser importadas dinámicamente **dentro del cuerpo** de la función que las necesite.
4.  **Desacoplamiento:** Mantener las funciones pequeñas, atómicas y especializadas en una sola acción de negocio. Evitar funciones gigantescas monolíticas que agrupen demasiados servicios.

## 🔒 Validaciones e Integridad de Datos (Doble Capa)
No se confía en la validación realizada en la interfaz web (frontend):
5.  **Validación de Esquema Obligatoria:** Toda función invocable (`onCall`) o HTTPS (`onRequest`) debe validar la estructura y tipo de datos del payload de entrada de manera estricta utilizando esquemas de validación (como Joi, Zod o funciones de validación manual exhaustivas) antes de interactuar con Firestore.
6.  **Sanitización de Datos:** Limpiar y sanitizar todas las entradas de texto para evitar inyecciones de datos o caracteres inválidos en la base de datos.

## 📝 Registro de Actividad y Manejo de Errores (Structured Logging)
7.  **Bloques Try/Catch Obligatorios:** Toda la lógica de ejecución dentro del cuerpo de la función debe estar envuelta en bloques `try/catch`.
8.  **Logs Estructurados:** Utilizar el logger nativo de Firebase (`firebase-functions/logger`) para registrar la actividad de depuración:
    *   Usar `logger.info()` para eventos ordinarios de ciclo de vida.
    *   Usar `logger.warn()` para comportamientos inesperados pero no críticos.
    *   Usar `logger.error()` en capturas `catch` con el objeto de error completo.
9.  **Errores Semánticos para el Frontend:** Cuando ocurra un fallo, no retornar códigos de error HTTP genéricos de Node.js. Se debe lanzar un error semántico estructurado utilizando `HttpsError` de Firebase:
    *   *Ejemplo:* `throw new functions.https.HttpsError('failed-precondition', 'El usuario no tiene un rol válido.');`
    *   Esto permite al frontend capturar y mostrar un mensaje visual amigable para el usuario final.
