'use strict';

// Zombie Enemy - Tanky but slow, very common
class ZombieEnemy extends BaseEnemy {
    static CONFIG = {
        SIZE: 32,
        HEALTH: 1000,
        DAMAGE: 40,
        COLLISION_DISTANCE: 40,
        DAMAGE_COOLDOWN: 2000, // 2 seconds between attacks
        SPEED: 100, // 1/3 of player base speed (300 / 3 = 100)
        CAN_MOVE: true, // Zombies can now move
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
        // Get player reference from global game state
        if (typeof window.getPlayerPosition === 'function') {
            const playerPos = window.getPlayerPosition();

            if (playerPos) {
                // Calculate direction to player
                const direction = this.getDirectionTo(playerPos.x, playerPos.y);

                // Calculate distance to player
                const distance = Math.sqrt(
                    Math.pow(playerPos.x - this.x, 2) +
                    Math.pow(playerPos.y - this.y, 2)
                );

                // Only move if not too close (to avoid jittering at collision distance)
                if (distance > this.collisionDistance + 5) {
                    // Move towards player using timeDelta for smooth movement
                    const moveSpeed = this.speed * timeDelta;

                    const newX = this.x + (direction.x * moveSpeed);
                    const newY = this.y + (direction.y * moveSpeed);

                    // Keep within game bounds
                    const clampedX = Math.max(16, Math.min(GAME_CONFIG.WIDTH - 16, newX));
                    const clampedY = Math.max(16, Math.min(GAME_CONFIG.HEIGHT - 16, newY));

                    // Update position
                    this.moveTo(clampedX, clampedY);
                }
            }
        }
    }

    // Zombie-specific behavior when taking damage
    takeDamage(amount) {
        const actualDamage = super.takeDamage(amount);

        // Zombies are tanky - maybe add special effects for high damage resistance
        if (actualDamage > 0 && !this.destroyed) {
            console.log(`Zombie ${this.id} took ${actualDamage} damage! Remaining: ${this.health}/${this.maxHealth} HP`);
        }

        return actualDamage;
    }

    // Zombie-specific attack behavior
    damagePlayer(player) {
        const didDamage = super.damagePlayer(player);

        if (didDamage) {
            console.log(`Zombie ${this.id} shambles and attacks!`);
        }

        return didDamage;
    }
}

console.log('ZombieEnemy class loaded successfully');