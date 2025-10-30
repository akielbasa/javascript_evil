'use strict';

class Inventory {
    static CONFIG = {
        SLOTS: 3
    };

    constructor() {
        this.slots = new Array(Inventory.CONFIG.SLOTS).fill(null);
        this.domSlots = [];
        this.initializeDOM();
    }

    initializeDOM() {
        // Get all inventory slot elements
        for (let i = 0; i < Inventory.CONFIG.SLOTS; i++) {
            const slot = document.querySelector(`#inventorySlots .inventory-slot[data-key="${i + 1}"]`);
            if (slot) {
                this.domSlots.push(slot);
            }
        }
        this.updateDisplay();
    }

    addItem(itemData) {
        // Check if item is stackable
        if (itemData.stackable) {
            // Look for existing stack of the same type
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots[i];
                if (slot && slot.type === itemData.type && slot.quantity < slot.maxStack) {
                    // Add to existing stack
                    slot.quantity += itemData.quantity;
                    if (slot.quantity > slot.maxStack) {
                        slot.quantity = slot.maxStack;
                    }
                    this.updateDisplay();
                    console.log(`Added ${itemData.name} to existing stack. New quantity: ${slot.quantity}`);
                    return true;
                }
            }
        }

        // Find first empty slot (for non-stackable items or new stacks)
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = { ...itemData };
                this.updateDisplay();
                console.log(`Added ${itemData.name} to inventory slot ${i + 1}`);
                return true;
            }
        }

        return false; // Inventory full
    }

    useItem(slotIndex, player) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) return false;

        const itemData = this.slots[slotIndex];
        if (itemData && itemData.item) {
            // Use the item
            const result = itemData.item.use(player);

            if (result.success) {
                // Item was used successfully
                if (itemData.stackable && !result.shouldRemove) {
                    // Stackable item that shouldn't be completely removed - reduce quantity
                    itemData.quantity--;

                    if (itemData.quantity <= 0) {
                        // Stack is empty
                        if (itemData.disbandable) {
                            // Remove the item completely
                            this.slots[slotIndex] = null;
                            console.log(`${itemData.name} stack depleted and disbanded`);
                        } else {
                            // Keep the item but reset quantity to 0 (for non-disbandable items)
                            itemData.quantity = 0;
                            console.log(`${itemData.name} stack depleted but kept`);
                        }
                    }
                } else if (result.shouldRemove) {
                    // Non-stackable item or item that should be completely removed
                    if (itemData.disbandable) {
                        this.slots[slotIndex] = null;
                        console.log(`${itemData.name} used and disbanded`);
                    } else {
                        // Keep the item but mark it as used (for non-disbandable items)
                        console.log(`${itemData.name} used but kept`);
                    }
                }

                this.updateDisplay();
                console.log(`Used ${itemData.name} from slot ${slotIndex + 1}`);
                return true;
            } else {
                // Item use failed (e.g., already at full health)
                console.log(`Cannot use ${itemData.name} right now`);
                return false;
            }
        }
        return false;
    }

    updateDisplay() {
        for (let i = 0; i < this.slots.length; i++) {
            const slotElement = this.domSlots[i];
            if (slotElement) {
                // Clear current content
                slotElement.innerHTML = '';

                if (this.slots[i] && this.slots[i].quantity > 0) {
                    // Slot has item
                    slotElement.classList.remove('empty');
                    slotElement.classList.add('filled');

                    // Add the item's visual representation
                    const itemElement = this.slots[i].item.createInventoryElement(this.slots[i].quantity);
                    if (itemElement) {
                        slotElement.appendChild(itemElement);

                        // Add quantity display for stackable items
                        if (this.slots[i].stackable && this.slots[i].quantity > 1) {
                            const quantityElement = document.createElement('div');
                            quantityElement.className = 'item-quantity';
                            quantityElement.textContent = this.slots[i].quantity;
                            quantityElement.style.cssText = `
                                position: absolute;
                                bottom: 2px;
                                right: 2px;
                                background: rgba(0, 0, 0, 0.8);
                                color: white;
                                font-size: 10px;
                                padding: 1px 3px;
                                border-radius: 2px;
                                font-weight: bold;
                            `;
                            slotElement.appendChild(quantityElement);
                        }
                    }
                } else {
                    // Empty slot
                    slotElement.classList.remove('filled');
                    slotElement.classList.add('empty');
                }

                // Re-add the key number
                slotElement.setAttribute('data-key', i + 1);
            }
        }
    }

    highlightSlot(slotIndex, highlight = true) {
        if (slotIndex >= 0 && slotIndex < this.domSlots.length) {
            const slot = this.domSlots[slotIndex];
            if (highlight) {
                slot.classList.add('active');
                setTimeout(() => slot.classList.remove('active'), 200);
            } else {
                slot.classList.remove('active');
            }
        }
    }

    isEmpty() {
        return this.slots.every(slot => slot === null || slot.quantity <= 0);
    }

    isFull() {
        return this.slots.every(slot => slot !== null && slot.quantity > 0);
    }

    getSlotCount() {
        return this.slots.length;
    }

    getFilledSlotCount() {
        return this.slots.filter(slot => slot !== null && slot.quantity > 0).length;
    }

    // Get details about inventory contents
    getInventoryInfo() {
        const info = {
            totalSlots: this.slots.length,
            usedSlots: 0,
            items: []
        };

        this.slots.forEach((slot, index) => {
            if (slot && slot.quantity > 0) {
                info.usedSlots++;
                info.items.push({
                    slot: index + 1,
                    name: slot.name,
                    quantity: slot.quantity,
                    stackable: slot.stackable,
                    disbandable: slot.disbandable
                });
            }
        });

        return info;
    }
}

console.log('Inventory class loaded successfully');