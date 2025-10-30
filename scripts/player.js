'use strict';

// Player Configuration
const PLAYER_CONFIG = {
    // Physical settings
    SIZE: 48,
    BASE_SPEED: 300,

    // Health settings
    MAX_HEALTH: 100,
    HEALTH_SPEED_THRESHOLD_1: 70,
    HEALTH_SPEED_THRESHOLD_2: 40,
    SPEED_MULTIPLIER_INJURED: 0.8,
    SPEED_MULTIPLIER_CRITICAL: 0.6,

    // Combat settings
    ATTACK_DAMAGE: 300,
    ATTACK_RANGE: 60,
    ATTACK_DURATION: 300, // milliseconds
    ATTACK_COOLDOWN: 500, // milliseconds
    NUDGE_DISTANCE: 8, // pixels to nudge right during attack

    // Health bar colors
    HEALTH_COLORS: {
        DEEP_GREEN: '#006400',
        RED: '#CC0000'
    },

    // Effects
    HEALING_EFFECT_DURATION: 500, // milliseconds
    DAMAGE_EFFECT_DURATION: 400, // milliseconds
    DEATH_ANIMATION_DURATION: 1000 // milliseconds
};

class Player extends EngineObject {
    constructor(pos) {
        super(pos, vec2(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE));

        // Player attributes
        this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;
        this.health = PLAYER_CONFIG.MAX_HEALTH;
        this.baseSpeed = PLAYER_CONFIG.BASE_SPEED;
        this.currentSpeed = this.baseSpeed;

        // Combat state
        this.isAttacking = false;
        this.isInvulnerable = false;
        this.lastAttackTime = 0;
        this.originalPosition = { x: 0, y: 0 };

        // State
        this.isDead = false;
        this.canMove = true;

        // Initialize inventory
        this.inventory = new Inventory();

        this.setCollision(false);

        this.initializeDOMReferences();
        this.updateMovementSpeed();
        this.updateDivPosition();
    }

    initializeDOMReferences() {
        DOM.playerDiv = document.getElementById('player');
        DOM.positionDiv = document.getElementById('position');
        DOM.speedDiv = document.getElementById('speed');
        DOM.healthBar = document.getElementById('healthBar');
        DOM.healthFill = document.getElementById('healthFill');
    }

    updateMovementSpeed() {
        if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_2) {
            this.currentSpeed = this.baseSpeed * PLAYER_CONFIG.SPEED_MULTIPLIER_CRITICAL;
        } else if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_1) {
            this.currentSpeed = this.baseSpeed * PLAYER_CONFIG.SPEED_MULTIPLIER_INJURED;
        } else {
            this.currentSpeed = this.baseSpeed;
        }
    }

    canAttack() {
        const currentTime = Date.now();
        return !this.isDead && !this.isAttacking &&
            (currentTime - this.lastAttackTime >= PLAYER_CONFIG.ATTACK_COOLDOWN);
    }

    attack() {
        if (!this.canAttack()) return false;

        this.isAttacking = true;
        this.isInvulnerable = true;
        this.lastAttackTime = Date.now();

        // Store original position for nudging
        this.originalPosition = { x: this.pos.x, y: this.pos.y };

        console.log('⚔️ Player attacking!');

        // Apply attack nudge (move right)
        this.nudgeRight();

        // Deal damage to enemies in range
        this.damageEnemiesInRange();

        // End attack after duration
        setTimeout(() => {
            this.endAttack();
        }, PLAYER_CONFIG.ATTACK_DURATION);

        return true;
    }

    nudgeRight() {
        // Move player slightly to the right during attack
        const newX = Math.min(this.pos.x + PLAYER_CONFIG.NUDGE_DISTANCE, GAME_CONFIG.WIDTH - 24);
        this.pos.x = newX;
        this.updateDivPosition();

        // Add visual attack effect
        if (DOM.playerDiv) {
            DOM.playerDiv.classList.add('attacking');
        }
    }

    damageEnemiesInRange() {
        // Notify game manager to check for enemies in attack range
        if (typeof window.onPlayerAttack === 'function') {
            const attackedEnemies = window.onPlayerAttack(this.pos, PLAYER_CONFIG.ATTACK_RANGE, PLAYER_CONFIG.ATTACK_DAMAGE);

            if (attackedEnemies > 0) {
                console.log(`💥 Hit ${attackedEnemies} enemies for ${PLAYER_CONFIG.ATTACK_DAMAGE} damage each!`);
            } else {
                console.log('💨 Attack missed - no enemies in range');
            }
        }
    }

    endAttack() {
        this.isAttacking = false;
        this.isInvulnerable = false;

        // Return to original position (remove nudge)
        this.pos.x = this.originalPosition.x;
        this.updateDivPosition();

        // Remove visual attack effect
        if (DOM.playerDiv) {
            DOM.playerDiv.classList.remove('attacking');
        }

        console.log('✅ Attack finished');
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvulnerable) {
            if (this.isInvulnerable) {
                console.log('🛡️ Player is invulnerable - no damage taken!');
            }
            return;
        }

        this.health = Math.max(0, this.health - amount);
        this.updateMovementSpeed();
        this.updateHealthBar();

        console.log(`Player took ${amount} damage! Health: ${this.health}/${this.maxHealth}`);

        // Play damage visual effect
        this.playDamageEffect();

        // Check if player died
        if (this.health <= 0) {
            this.die();
        }
    }

    playDamageEffect() {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.add('damage-effect');
            setTimeout(() => {
                gameContainer.classList.remove('damage-effect');
            }, PLAYER_CONFIG.DAMAGE_EFFECT_DURATION);
            console.log('💥 Damage effect played!');
        }
    }

    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.canMove = false;
        this.isAttacking = false;
        this.isInvulnerable = false;

        console.log('💀 Player has died!');

        this.playDeathAnimation();

        setTimeout(() => {
            this.triggerGameOver();
        }, PLAYER_CONFIG.DEATH_ANIMATION_DURATION);
    }

    playDeathAnimation() {
        const gameContainer = document.getElementById('gameContainer');

        if (DOM.playerDiv) {
            DOM.playerDiv.classList.add('dying');
        }

        if (gameContainer) {
            gameContainer.classList.add('player-dead');
        }

        console.log('💥 Playing death animation...');
    }

    triggerGameOver() {
        if (typeof window.onPlayerDeath === 'function') {
            window.onPlayerDeath();
        }
        console.log('⚰️ Game Over triggered');
    }

    heal(amount) {
        if (this.isDead) return 0;

        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;

        this.updateMovementSpeed();
        this.updateHealthBar();

        if (actualHeal > 0) {
            console.log(`Player healed ${actualHeal} HP! Health: ${this.health}/${this.maxHealth}`);
            this.playHealingEffect();
        }

        return actualHeal;
    }

    playHealingEffect() {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.add('healing-effect');
            setTimeout(() => {
                gameContainer.classList.remove('healing-effect');
            }, PLAYER_CONFIG.HEALING_EFFECT_DURATION);
            console.log('✨ Healing effect played!');
        }
    }

    getHealthColor() {
        const healthPercent = this.health / this.maxHealth;

        if (healthPercent > 0.9) {
            return PLAYER_CONFIG.HEALTH_COLORS.DEEP_GREEN;
        } else if (healthPercent > 0.7) {
            const factor = (healthPercent - 0.7) / 0.2;
            const red = Math.floor(50 + (0 - 50) * factor);
            const green = Math.floor(200 + (100 - 200) * factor);
            return `rgb(${red}, ${green}, 0)`;
        } else if (healthPercent > 0.4) {
            const factor = (healthPercent - 0.4) / 0.3;
            const red = Math.floor(255 + (50 - 255) * factor);
            const green = Math.floor(165 + (200 - 165) * factor);
            return `rgb(${red}, ${green}, 0)`;
        } else {
            return PLAYER_CONFIG.HEALTH_COLORS.RED;
        }
    }

    updateHealthBar() {
        if (DOM.healthBar && DOM.healthFill) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            DOM.healthFill.style.width = healthPercent + '%';
            DOM.healthFill.style.backgroundColor = this.getHealthColor();
        }
    }

    handleInput() {
        if (this.isDead) return vec2(0, 0);

        let moveVector = vec2(0, 0);

        // Attack input
        if (keyWasPressed('KeyQ')) {
            this.attack();
        }

        // Movement input (disabled during attack)
        if (!this.isAttacking && this.canMove) {
            if (keyIsDown('KeyA') || keyIsDown('ArrowLeft')) {
                moveVector.x = -1;
            }
            if (keyIsDown('KeyD') || keyIsDown('ArrowRight')) {
                moveVector.x = 1;
            }
            if (keyIsDown('KeyW') || keyIsDown('ArrowUp')) {
                moveVector.y = 1;
            }
            if (keyIsDown('KeyS') || keyIsDown('ArrowDown')) {
                moveVector.y = -1;
            }
        }

        // Inventory usage (keys 1, 2, 3)
        if (keyWasPressed('Digit1')) {
            this.useInventoryItem(0);
        }
        if (keyWasPressed('Digit2')) {
            this.useInventoryItem(1);
        }
        if (keyWasPressed('Digit3')) {
            this.useInventoryItem(2);
        }

        return moveVector;
    }

    useInventoryItem(slotIndex) {
        if (this.isDead) return;

        const success = this.inventory.useItem(slotIndex, this);
        if (success) {
            this.inventory.highlightSlot(slotIndex, true);
        } else {
            const slot = this.inventory.domSlots[slotIndex];
            if (slot) {
                slot.style.borderColor = '#FF4444';
                setTimeout(() => {
                    slot.style.borderColor = '';
                }, 300);
            }
        }
    }

    update() {
        if (this.isDead) return;

        const moveVector = this.handleInput();

        if (moveVector.x !== 0 || moveVector.y !== 0) {
            const normalizedMovement = moveVector.normalize();
            this.pos.x += normalizedMovement.x * this.currentSpeed * timeDelta;
            this.pos.y += normalizedMovement.y * this.currentSpeed * timeDelta;

            this.pos.x = clamp(this.pos.x, 24, GAME_CONFIG.WIDTH - 24);
            this.pos.y = clamp(this.pos.y, 24, GAME_CONFIG.HEIGHT - 24);

            this.updateDivPosition();
        }

        super.update();
    }

    getSpeedMultiplier() {
        if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_2) return "60%";
        if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_1) return "80%";
        return "100%";
    }

    getStatusText() {
        let status = [];
        if (this.isAttacking) status.push('ATTACKING');
        if (this.isInvulnerable) status.push('INVULNERABLE');
        return status.length > 0 ? ` [${status.join(', ')}]` : '';
    }

    updateDivPosition() {
        if (DOM.playerDiv && DOM.positionDiv && DOM.speedDiv && !this.isDead) {
            const htmlX = this.pos.x - this.size.x/2;
            const htmlY = (GAME_CONFIG.HEIGHT - this.pos.y) - this.size.y/2;

            DOM.playerDiv.style.left = htmlX + 'px';
            DOM.playerDiv.style.top = htmlY + 'px';

            DOM.positionDiv.textContent = `Player pos: ${this.pos.x.toFixed(1)}, ${this.pos.y.toFixed(1)}${this.getStatusText()}`;
            DOM.speedDiv.textContent = `Speed: ${this.currentSpeed.toFixed(0)} (${this.getSpeedMultiplier()})`;

            this.updatePlayerAppearance();
        }
    }

    updatePlayerAppearance() {
        if (this.isDead) return;

        let filter = '';

        if (this.isAttacking) {
            filter = 'brightness(1.5) drop-shadow(2px 0 4px rgba(255, 255, 0, 0.8))';
        } else if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_2) {
            filter = 'brightness(0.7) sepia(1) hue-rotate(0deg) saturate(2)';
        } else if (this.health < PLAYER_CONFIG.HEALTH_SPEED_THRESHOLD_1) {
            filter = 'brightness(0.9) sepia(0.5) hue-rotate(30deg) saturate(1.3)';
        }

        DOM.playerDiv.style.filter = filter;
    }

    reset(pos) {
        this.pos = pos;
        this.health = this.maxHealth;
        this.isDead = false;
        this.canMove = true;
        this.isAttacking = false;
        this.isInvulnerable = false;
        this.lastAttackTime = 0;

        this.updateMovementSpeed();
        this.updateHealthBar();

        this.inventory = new Inventory();

        if (DOM.playerDiv) {
            DOM.playerDiv.classList.remove('dying', 'attacking');
            DOM.playerDiv.style.filter = 'none';
        }

        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.remove('player-dead', 'damage-effect', 'healing-effect');
        }

        this.updateDivPosition();

        console.log('🔄 Player reset for new game');
    }

    render() {
        // No canvas rendering needed
    }
}

console.log('Player class loaded successfully');