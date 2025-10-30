'use strict';

// Zombie Enemy - Tanky but slow, very common
class ZombieEnemy extends BaseEnemy {
    static CONFIG = {
        SIZE: 32,
        HEALTH: 1000,
        DAMAGE: 50,
        COLLISION_DISTANCE: 40,
        DAMAGE_COOLDOWN: 2000, // 2 seconds between attacks
        SPEED: 0, // Currently no movement (will be added later)
        CAN_MOVE: false, // Will be true when we add movement
        NAME: 'Zombie',
        TYPE: 'zombie',
        COLOR_PRIMARY: '#FF6666',
        COLOR_SECONDARY: '#FF4444',
        COLOR_BORDER: '#CC0000'
    };

    constructor(x, y, id) {
        super(x, y, id, ZombieEnemy.CONFIG);
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'enemy zombie-enemy';
        this.element.id = `zombie-${this.id}`;

        // Position the element
        this.element.style.left = (this.x - this.size/2) + 'px';
        this.element.style.top = (GAME_CONFIG.HEIGHT - this.y - this.size/2) + 'px';

        // Apply zombie-specific styling
        this.element.style.background = `radial-gradient(circle, ${this.config.COLOR_PRIMARY} 0%, ${this.config.COLOR_SECONDARY} 70%, ${this.config.COLOR_BORDER} 100%)`;
        this.element.style.borderColor = this.config.COLOR_BORDER;

        // Add to game container
        document.getElementById('gameContainer').appendChild(this.element);
    }

    updateMovement() {
        // For now, zombies don't move
        // This will be implemented later when we add movement
        // Future: Slow movement toward player
    }

    // Zombie-specific behavior when taking damage
    takeDamage(amount) {
        const actualDamage = super.takeDamage(amount);

        // Zombies are tanky - maybe add special effects for high damage resistance
        if (actualDamage > 0 && !this.destroyed) {
            // Could add zombie-specific hurt sounds or effects here
            console.log(`Zombie ${this.id} shrugs off ${actualDamage} damage! Still has ${this.health} HP.`);
        }

        return actualDamage;
    }

    // Zombie-specific attack behavior
    damagePlayer(player) {
        const didDamage = super.damagePlayer(player);

        if (didDamage) {
            // Add zombie-specific attack effects
            console.log(`Zombie ${this.id} shambles and attacks!`);
            // Future: Add zombie attack sound/animation
        }

        return didDamage;
    }
}

console.log('ZombieEnemy class loaded successfully');