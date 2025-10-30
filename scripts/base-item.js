'use strict';

// Base Item class
class BaseItem {
    constructor(x, y, id, config) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.config = config;
        this.collected = false;

        this.createElement();
    }

    createElement() {
        // Override in subclasses
        throw new Error('createElement must be implemented by subclass');
    }

    checkPickup(playerPos) {
        if (this.collected) return false;

        const dx = this.x - playerPos.x;
        const dy = this.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.config.PICKUP_DISTANCE;
    }

    pickup() {
        if (this.collected) return;

        this.collected = true;
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
        console.log(`${this.config.NAME} picked up!`);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }

    // Create inventory representation - override in subclasses
    createInventoryElement() {
        throw new Error('createInventoryElement must be implemented by subclass');
    }

    // Use the item - override in subclasses
    // Should return: { success: boolean, shouldRemove: boolean }
    use(player) {
        throw new Error('use method must be implemented by subclass');
    }

    // Get item data for inventory
    getItemData() {
        return {
            type: this.config.TYPE,
            name: this.config.NAME,
            stackable: this.config.STACKABLE,
            disbandable: this.config.DISBANDABLE,
            maxStack: this.config.MAX_STACK || 1,
            item: this,
            quantity: 1
        };
    }
}

console.log('BaseItem class loaded successfully');