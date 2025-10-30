'use strict';

// Base Enemy class
class BaseEnemy {
    constructor(x, y, id, config) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.config = config;

        // Health and combat properties
        this.maxHealth = config.HEALTH;
        this.health = config.HEALTH;
        this.damage = config.DAMAGE;
        this.collisionDistance = config.COLLISION_DISTANCE;
        this.size = config.SIZE;

        // Movement properties
        this.speed = config.SPEED || 0;
        this.canMove = config.CAN_MOVE || false;

        // Damage cooldown system
        this.lastDamageTime = 0;
        this.damageCooldown = config.DAMAGE_COOLDOWN;

        // State
        this.destroyed = false;
        this.movementTarget = null;

        this.createElement();

        console.log(`${this.config.NAME} ${this.id} created at (${this.x}, ${this.y}) with ${this.health} HP`);
    }

    createElement() {
        // Override in subclasses for different visual styles
        throw new Error('createElement must be implemented by subclass');
    }

    checkCollision(playerPos) {
        if (this.destroyed) return false;

        const dx = this.x - playerPos.x;
        const dy = this.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.collisionDistance;
    }

    canDamagePlayer() {
        const currentTime = Date.now();
        const canDamage = currentTime - this.lastDamageTime >= this.damageCooldown;

        if (!canDamage) {
            // Debug: Show remaining cooldown
            const remainingCooldown = ((this.damageCooldown - (currentTime - this.lastDamageTime)) / 1000).toFixed(1);
            console.log(`${this.config.NAME} ${this.id} on cooldown: ${remainingCooldown}s remaining`);
        }

        return canDamage;
    }

    damagePlayer(player) {
        if (this.destroyed || !this.canDamagePlayer()) return false;

        // Check if player is invulnerable (during attack)
        if (player.isInvulnerable) {
            console.log(`${this.config.NAME} ${this.id} attack blocked - player is invulnerable!`);
            return false;
        }

        // Deal damage to player
        player.takeDamage(this.damage);
        this.lastDamageTime = Date.now();

        // Visual feedback - flash the enemy
        this.flashDamage();

        console.log(`${this.config.NAME} ${this.id} dealt ${this.damage} damage to player!`);
        return true;
    }

    flashDamage() {
        if (this.element) {
            this.element.classList.add('attacking');
            setTimeout(() => {
                if (this.element) {
                    this.element.classList.remove('attacking');
                }
            }, 300);
        }
    }

    takeDamage(amount) {
        if (this.destroyed) return 0;

        const oldHealth = this.health;
        this.health = Math.max(0, this.health - amount);
        const actualDamage = oldHealth - this.health;

        console.log(`${this.config.NAME} ${this.id} took ${actualDamage} damage! Health: ${this.health}/${this.maxHealth}`);

        // Visual feedback for taking damage
        this.flashHurt();

        // Check if enemy is defeated
        if (this.health <= 0) {
            this.destroy();
        }

        return actualDamage;
    }

    flashHurt() {
        if (this.element) {
            this.element.classList.add('hurt');
            setTimeout(() => {
                if (this.element) {
                    this.element.classList.remove('hurt');
                }
            }, 200);
        }
    }

    destroy() {
        if (this.destroyed) return;

        this.destroyed = true;

        if (this.element && this.element.parentNode) {
            // Add destruction animation
            this.element.classList.add('dying');

            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.remove();
                }
            }, 500); // Remove after death animation
        }

        console.log(`${this.config.NAME} ${this.id} has been defeated!`);
    }

    update() {
        // Update visual state
        this.updateVisualState();

        // Handle movement if enemy can move
        if (this.canMove && !this.destroyed) {
            this.updateMovement();
        }
    }

    updateVisualState() {
        if (this.element && !this.destroyed) {
            // Visual changes based on health percentage
            const healthPercent = this.health / this.maxHealth;

            if (healthPercent < 0.3) {
                this.element.classList.add('low-health');
            } else {
                this.element.classList.remove('low-health');
            }
        }
    }

    updateMovement() {
        // Override in subclasses for specific movement patterns
        // Base class doesn't move
    }

    moveTo(newX, newY) {
        if (this.destroyed) return;

        this.x = newX;
        this.y = newY;

        if (this.element) {
            this.element.style.left = (this.x - this.size/2) + 'px';
            this.element.style.top = (GAME_CONFIG.HEIGHT - this.y - this.size/2) + 'px';
        }
    }

    // Utility methods
    getPosition() {
        return { x: this.x, y: this.y };
    }

    isDestroyed() {
        return this.destroyed;
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    distanceToPlayer(playerPos) {
        const dx = this.x - playerPos.x;
        const dy = this.y - playerPos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Get normalized direction vector toward target
    getDirectionTo(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return { x: 0, y: 0 };

        return {
            x: dx / distance,
            y: dy / distance
        };
    }
}

console.log('BaseEnemy class loaded successfully');