/**
 * @fileoverview terminal-template - Plantilla de consola BNE para AuditTerminalModal.
 * @module shared/ui/components/audit/terminal-template
 */
export const terminalTemplate = ({ profile = 'balanced', fps = 60, memory = '4', latency = '20', uptime = 0 } = {}) => `
    <div class="terminal-body p-3 rounded-3">
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2 term-border">
            <span class="term-muted">B.U.C.A Neural Shell (BNE-CLI)</span>
            <span class="term-success">ONLINE</span>
        </div>
        <div class="mb-1"><span class="term-purple">sys.core:</span> Kernel activo en modo <strong class="term-white">${profile.toUpperCase()}</strong> (${fps} FPS)</div>
        <div class="mb-1"><span class="term-purple">sys.memory:</span> JS Heap Asignado: <strong class="term-white">${memory} GB</strong></div>
        <div class="mb-1"><span class="term-purple">sys.network:</span> Latencia hacia Cloud: <strong class="term-success">${latency} ms</strong></div>
        <div class="mb-1"><span class="term-purple">sys.uptime:</span> Tiempo de sesión: <strong class="term-white">${uptime}s</strong></div>
        <div class="mt-3 pt-2 border-top term-border term-prompt">
            buca@workstation:~$ <span class="animate__animated animate__flash animate__infinite">_</span>
        </div>
    </div>
`;

export default terminalTemplate;
