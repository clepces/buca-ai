# 🛡️ Política de Seguridad y Divulgación Responsable — B.U.C.A. AI

En **B.U.C.A. AI**, la integridad de los datos financieros, comerciales y de identidad de nuestros usuarios e inquilinos es una prioridad inquebrantable. Este documento detalla nuestras directivas de blindaje perimetral, gestión de secretos, aislamiento multi-inquilino y el protocolo para reportar vulnerabilidades.

---

## 🔒 1. Principios de Seguridad y Perímetro de Defensa

### 1.1. Aislamiento Multi-Tenant con Row Level Security (RLS)
La aplicación opera sobre **Supabase (PostgreSQL 15+)** con políticas de seguridad a nivel de fila (**RLS**) activadas en el 100% de las tablas transaccionales:
- **InitPlan O(1) Optimization:** Toda política RLS evalúa la identidad del usuario autenticado mediante subconsultas escalares estandarizadas:
  ```sql
  -- Ejemplo de política inmutable
  CREATE POLICY "businesses_select_owner" ON public.businesses
      FOR SELECT TO authenticated
      USING (owner_id = (SELECT auth.uid()));
  ```
- **Aislamiento por Inquilino:** Los datos de comercios, ventas, inventarios y staff están particionados por `owner_id` o `tenant_id`. Ninguna consulta desde el cliente puede acceder a registros de otros negocios.
- **Mínimo Privilegio:** Operaciones sensibles (como marcar notificaciones como leídas) tienen revocado el privilegio `UPDATE` directo en el cliente y se ejecutan exclusivamente a través de funciones almacenadas seguras (**RPC**) con validación de contexto `SECURITY DEFINER`.

### 1.2. Blindaje de Variables de Entorno y Manejo de Secretos
- **Separación Estricta:** Las variables de desarrollo se configuran en `.env.local`, el cual está permanentemente excluido del control de versiones (`.gitignore`).
- **Validación Fail-Fast:** El módulo `src/core/config/environment.js` verifica al arranque que las claves críticas existan y tengan el formato adecuado antes de inicializar el Kernel. Si alguna variable está ausente, el arranque se detiene de forma segura.
- **Prohibición de `SERVICE_ROLE_KEY` en el Cliente:** La clave pública anónima de Supabase (`VITE_SUPABASE_ANON_KEY`) es la única expuesta en el frontend para autenticar peticiones filtradas por RLS. **Bajo ninguna circunstancia** la clave de administración (`SUPABASE_SERVICE_ROLE_KEY`) debe incluirse en el frontend o subirse al repositorio.

### 1.3. Seguridad de Sesión y Autenticación Multi-Factor (MFA)
- **Desafío AAL2 (Authenticator Assurance Level 2):** Se exige verificación TOTP (RFC 6238) para operaciones y sesiones de nivel administrativo.
- **Generación Segura de Claves:** El servicio `src/core/security/BackupKeyService.js` genera claves de emergencia de un solo uso (`BUCA-XXXX-XXXX`) utilizando la Web Crypto API nativa (`window.crypto.getRandomValues`).
- **Renderizado QR Inmune:** El código QR para enrolamiento MFA se procesa localmente en un elemento `<canvas>` 2D en memoria sin enviar el secreto TOTP a servicios externos de generación de imágenes.

---

## 🛑 2. Manejo de Errores y Cero Stack Traces (UUID Safety)

Para evitar la fuga de rutas de disco, nombres de esquemas internos o metadatos de infraestructura:
1. Las respuestas de error en producción están sanitizadas.
2. Todo error inesperado se captura y se asocia a un identificador único (**UUID**) que se registra en la bitácora interna de auditoría (`activity_log`), sin exponer volcados de pila (*stack traces*) al usuario final.

---

## 📢 3. Protocolo de Divulgación Responsable (Vulnerability Reporting)

Si has descubierto una vulnerabilidad de seguridad en el código de **B.U.C.A. AI**, te solicitamos encarecidamente que **NO abras un Issue público** en GitHub.

### Procedimiento para Notificar:
1. Envía un correo electrónico detallado a nuestro equipo de seguridad o a los mantenedores principales del proyecto.
2. Incluye en tu reporte:
   - Descripción detallada de la vulnerabilidad y vector de ataque.
   - Pasos precisos para reproducir el fallo (PoC o script de prueba).
   - Componentes o endpoints afectados.
   - Evaluación del impacto potencial.
3. Te enviaremos una confirmación de recepción en un plazo máximo de **48 horas**.
4. Mantendremos una comunicación constante mientras se investiga y se prepara el parche correspondiente.
5. Te daremos el debido crédito en nuestras notas de versión una vez que la corrección haya sido desplegada formalmente.

Agradecemos profundamente el compromiso de la comunidad y los investigadores de seguridad para mantener la soberanía y protección del ecosistema **B.U.C.A. AI**.
