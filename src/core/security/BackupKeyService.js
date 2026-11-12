/**
 * BackupKeyService - Gestión de Claves de Emergencia para MFA (TOTP)
 * =========================================================================
 * Genera, formatea, descarga e imprime claves de respaldo de emergencia
 * en memoria del cliente (Zero-Knowledge) para un solo uso.
 * Cero almacenamiento en texto plano o cifrado XOR con clave fija en servidor.
 * =========================================================================
 */

export class BackupKeyService {
    /**
     * Genera un conjunto de claves de emergencia alfanuméricas criptográficamente seguras.
     * Formato: BUCA-XXXX-XXXX (8 claves)
     * @param {number} [count=8]
     * @returns {string[]}
     */
    static generateKeys(count = 8) {
        const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluye 0, O, 1, I para evitar confusión
        const keys = [];

        for (let i = 0; i < count; i++) {
            const randomBytes = new Uint8Array(8);
            globalThis.crypto.getRandomValues(randomBytes);
            let part1 = '';
            let part2 = '';
            for (let j = 0; j < 4; j++) {
                part1 += charset[randomBytes[j] % charset.length];
                part2 += charset[randomBytes[j + 4] % charset.length];
            }
            keys.push(`BUCA-${part1}-${part2}`);
        }

        return keys;
    }

    /**
     * Formatea el texto legible para archivo descargable o impresión.
     * @param {string[]} keys 
     * @param {string} email 
     * @returns {string}
     */
    static formatSlip(keys, email = '') {
        const dateStr = new Date().toLocaleString();
        return `=====================================================
 B.U.C.A. AI - CLAVES DE RESPALDO DE EMERGENCIA (MFA)
=====================================================
Cuenta Asociada : ${email || 'Usuario B.U.C.A.'}
Fecha de Emisión: ${dateStr}
Instancia       : B.U.C.A. Enterprise ERP (v1.1.4-Alpha)

IMPORTANTE:
- Cada clave es de UN SOLO USO.
- Guárdelas en un lugar seguro (administrador de contraseñas o papel).
- Se exigirán si pierde el dispositivo móvil con Google Authenticator.

-----------------------------------------------------
CLAVES DE EMERGENCIA:
-----------------------------------------------------
${keys.map((k, idx) => `[${idx + 1}]  ${k}`).join('\n')}
-----------------------------------------------------
Emitido localmente en memoria segura (Zero-Knowledge Client-Only).
=====================================================`;
    }

    /**
     * Descarga las claves en un archivo de texto local (.txt).
     * @param {string[]} keys 
     * @param {string} email 
     */
    static downloadAsText(keys, email = '') {
        const textContent = this.formatSlip(keys, email);
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `buca-mfa-backup-keys-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Imprime un comprobante físico de las claves de emergencia.
     * @param {string[]} keys 
     * @param {string} email 
     */
    static printSlip(keys, email = '') {
        const textContent = this.formatSlip(keys, email);
        const printWindow = window.open('', '_blank', 'width=600,height=600');
        if (!printWindow) {
            console.warn('[BackupKeyService] Popup bloqueado para impresión; descargando archivo.');
            this.downloadAsText(keys, email);
            return;
        }

        const doc = printWindow.document;
        doc.title = 'B.U.C.A. AI - Claves de Emergencia MFA';

        const style = doc.createElement('style');
        style.textContent = 'body { font-family: monospace; padding: 24px; white-space: pre-wrap; font-size: 13px; color: #000; }';
        doc.head.appendChild(style);

        const pre = doc.createElement('pre');
        pre.textContent = textContent;
        doc.body.appendChild(pre);

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    /**
     * Confirma la emisión en memoria segura (Zero-Knowledge).
     * Las claves NO se almacenan en servidores externos para evitar fugas.
     * @param {string} uid 
     * @param {string[]} keys 
     */
    static async acknowledgeEmission(uid, keys) {
        if (!uid || !Array.isArray(keys)) return false;
        console.log(`[BackupKeyService] ${keys.length} claves emitidas localmente para ${uid}.`);
        return true;
    }
}

export default BackupKeyService;
