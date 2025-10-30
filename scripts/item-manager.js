
'use strict';

// Item Manager for handling all items
class ItemManager {
    constructor() {
        this.items = [];
        this.itemIdCounter = 0;
    }

    createHealthItems() {
        // Create 4 health items at different positions
        const positions = [
            {x: 200, y: 600},
            {x: 800, y: 600},
            {x: 400, y: 200},
            {x: 1000, y: 400}
        ];

        positions.forEach(pos => {
            const item = new HealthItem(pos.x, pos.y, this.itemIdCounter++);
            this.items.push(item);
        });

        console.log(`Created ${this.items.length} health items`);
    }

    // Generic method to add any item type
    addItem(item) {
        this.items.push(item);
        console.log(`Added ${item.config.NAME} to world`);
    }

    // Create items by type and position
    createItem(itemType, x, y) {
        let item = null;

        switch(itemType) {
            case 'health':
                item = new HealthItem(x, y, this.itemIdCounter++);
                break;
            // Add more item types here as you create them
            // case 'mana':
            //     item = new ManaItem(x, y, this.itemIdCounter++);
            //     break;
            default:
                console.warn(`Unknown item type: ${itemType}`);
                return null;
        }

        if (item) {
            this.items.push(item);
            return item;
        }
        return null;
    }

    checkPickups(playerPos, inventory) {
        this.items.forEach(item => {
            if (!item.collected && item.checkPickup(playerPos)) {
                if (inventory.addItem(item.getItemData())) {
                    item.pickup();
                } else {
                    console.log('Inventory is full!');
                }
            }
        });
    }

    removeCollectedItems() {
        this.items = this.items.filter(item => !item.collected);
    }

    getItemCount() {
        return this.items.length;
    }

    getCollectedCount() {
        return this.items.filter(item => item.collected).length;
    }

    getActiveItems() {
        return this.items.filter(item => !item.collected);
    }

    destroy() {
        this.items.forEach(item => item.destroy());
        this.items = [];
        this.itemIdCounter = 0;
    }
}

console.log('ItemManager class loaded successfully');