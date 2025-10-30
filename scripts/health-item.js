'use strict';

// Health Potion Item
class HealthItem extends BaseItem {
    static CONFIG = {
        SIZE: 24,
        COLOR: '#00AA00',
        HEAL_AMOUNT: 30,
        PICKUP_DISTANCE: 30,
        NAME: 'Health Potion',
        TYPE: 'health_potion',
        STACKABLE: false,        // Health items are NOT stackable
        DISBANDABLE: true,       // Health items are disbanded when used
        MAX_STACK: 1
    };

    constructor(x, y, id) {
        super(x, y, id, HealthItem.CONFIG);
        this.healAmount = HealthItem.CONFIG.HEAL_AMOUNT;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'health-item';
        this.element.id = `health-item-${this.id}`;

        // Position the element
        this.element.style.left = (this.x - this.config.SIZE/2) + 'px';
        this.element.style.top = (GAME_CONFIG.HEIGHT - this.y - this.config.SIZE/2) + 'px';

        // Add to game container
        document.getElementById('gameContainer').appendChild(this.element);
    }

    createInventoryElement(quantity = 1) {
        const template = document.querySelector('.health-item-template');
        if (template) {
            const element = template.cloneNode(true);
            element.classList.remove('item-template');
            element.style.display = 'flex';

            // Since health items are not stackable, we don't show quantity
            // But we keep the parameter for consistency with other items

            return element;
        }
        return null;
    }

    use(player) {
        // Check if player is already at full health
        if (player.health >= player.maxHealth) {
            console.log('Already at full health! Cannot use health potion.');
            return { success: false, shouldRemove: false };
        }

        // Use the item - heal the player
        const healedAmount = player.heal(this.healAmount);

        if (healedAmount > 0) {
            console.log(`Used health potion! Healed ${healedAmount} HP.`);
            // Health items are disbandable - should be removed after use
            return { success: true, shouldRemove: true };
        }

        return { success: false, shouldRemove: false };
    }

    getItemData() {
        return {
            type: this.config.TYPE,
            value: this.healAmount,
            name: this.config.NAME,
            stackable: this.config.STACKABLE,
            disbandable: this.config.DISBANDABLE,
            maxStack: this.config.MAX_STACK,
            item: this,
            quantity: 1
        };
    }
}

console.log('HealthItem class loaded successfully');