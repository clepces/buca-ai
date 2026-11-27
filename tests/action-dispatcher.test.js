/**
 * ActionDispatcher & SharedActions — Integration & Security Test Suite
 */
import './dom-shim.js';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockDocument } from './dom-shim.js';
import { eventBus } from '../src/core/eventBus/index.js';
import { ActionDispatcher } from '../src/core/services/ActionDispatcher.js';
import { SharedActions } from '../src/shared/ui/services/shared-actions.js';
import { ModalService } from '../src/shared/ui/services/ModalService.js';

describe('ActionDispatcher & Clean Core Delegation Suite', () => {
    beforeEach(() => {
        ActionDispatcher.destroy();
        SharedActions.destroy();
        ModalService.destroy();
        ActionDispatcher.init();
        SharedActions.init();
        ModalService.init();
    });

    afterEach(() => {
        ActionDispatcher.destroy();
        SharedActions.destroy();
        ModalService.destroy();
    });

    it('Debe filtrar claves de Prototype Pollution en data-payload y marcar _bucaActionHandled', () => {
        let received = null;
        const off = eventBus.on('test:safe_action', (p) => { received = p; });

        const el = mockDocument.createElement('button');
        el.tagName = 'BUTTON';
        el.attributes = [
            { name: 'data-action', value: 'test:safe_action' },
            { name: 'data-tab', value: 'unread' },
            { name: 'data-tooltip', value: 'ignored' },
            { name: 'data-payload', value: '{"id":42,"__proto__":{"polluted":true},"constructor":{"bad":1}}' }
        ];
        el.getAttribute = (name) => el.attributes.find(a => a.name === name)?.value ?? null;
        el.hasAttribute = (name) => el.attributes.some(a => a.name === name);
        el.closest = (sel) => (sel === '[data-action]' ? el : null);

        const evt = { target: el, preventDefault: () => {} };
        mockDocument.dispatchEvent({ type: 'click', ...evt });

        off();
        assert.ok(received);
        assert.equal(received.id, 42);
        assert.equal(received.tab, 'unread');
        assert.equal('tooltip' in received, false);
        assert.equal(({}).polluted, undefined);
        assert.equal(Object.hasOwn(received, 'constructor'), false);
    });

    it('Debe prevenir navegación nativa en <a data-action="router:navigate"> para evitar doble disparo', () => {
        let prevented = false;
        let navPayload = null;
        const off = eventBus.on('router:navigate', (p) => { navPayload = p; });

        const link = mockDocument.createElement('a');
        link.tagName = 'A';
        link.attributes = [
            { name: 'data-action', value: 'router:navigate' },
            { name: 'data-payload', value: '{"path":"/workspace"}' }
        ];
        link.getAttribute = (name) => link.attributes.find(a => a.name === name)?.value ?? null;
        link.hasAttribute = (name) => link.attributes.some(a => a.name === name);
        link.closest = (sel) => (sel === '[data-action]' ? link : null);

        mockDocument.dispatchEvent({
            type: 'click',
            target: link,
            preventDefault: () => { prevented = true; }
        });

        off();
        assert.equal(prevented, true);
        assert.equal(navPayload?.path, '/workspace');
    });

    it('Debe registrar todas las acciones transversales en SharedActions y sanitizar ui:open_modal', () => {
        const expectedShared = [
            'notifications:filter_tab',
            'settings:toggle_glass',
            'ui:open_activity_log',
            'ui:open_search_palette',
            'ui:open_ai_assistant',
            'feedback:select_type',
            'ui:open_features_modal',
            'ui:open_changelog_modal',
            'ui:open_modal',
            'ui:close_modal'
        ];
        for (const action of expectedShared) {
            assert.equal(eventBus.hasListeners(action), true, `Falta suscriptor para ${action}`);
        }

        let modalArgs = null;
        const origShow = ModalService.showModal;
        ModalService.showModal = (cfg) => { modalArgs = cfg; };
        try {
            eventBus.emit('ui:open_modal', { title: '<script>xss</script>', body: '<img onerror=alert(1)>' });
            assert.ok(modalArgs);
            assert.equal(modalArgs.header.left.includes('<script>'), false);
            assert.equal(modalArgs.body.includes('<img'), false);
        } finally {
            ModalService.showModal = origShow;
        }
    });
});
