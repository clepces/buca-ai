export class LifecycleManager {
    constructor() {
        this.components = new Map();
    }

    register(id, destroyCallback) {
        this.components.set(id, destroyCallback);
    }

    unregister(id) {
        this.components.delete(id);
    }

    destroy(id) {
        if (this.components.has(id)) {
            this.components.get(id)();
            this.components.delete(id);
        }
    }

    destroyAll() {
        for (const callback of this.components.values()) {
            callback();
        }
        this.components.clear();
    }
}

export const lifecycleManager = new LifecycleManager();
