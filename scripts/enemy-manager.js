'use strict';

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.enemyIdCounter = 0;
    }

    createEnemies() {
        // Create different types of enemies
        this.createZombies();
        // Future: this.createSkeletons(), this.createGoblins(), etc.

        console.log(`Created ${this.enemies.length} total enemies`);
    }

    createZombies() {
        // Create 3 zombie enemies at different positions
        const zombiePositions = [
            {x: 300, y: 300},   // Bottom left area
            {x: 900, y: 300},   // Bottom right area
            {x: 600, y: 700}    // Top center area
        ];

        zombiePositions.forEach(pos => {
            const zombie = new ZombieEnemy(pos.x, pos.y, this.enemyIdCounter++);
            this.enemies.push(zombie);
        });

        console.log(`Created ${zombiePositions.length} zombie enemies`);
    }

    // Generic method to add any enemy type
    addEnemy(enemy) {
        this.enemies.push(enemy);
        console.log(`Added ${enemy.config.NAME} to world`);
    }

    // Create enemies by type and position
    createEnemy(enemyType, x, y) {
        let enemy = null;

        switch(enemyType) {
            case 'zombie':
                enemy = new ZombieEnemy(x, y, this.enemyIdCounter++);
                break;
            // Add more enemy types here as you create them
            // case 'skeleton':
            //     enemy = new SkeletonEnemy(x, y, this.enemyIdCounter++);
            //     break;
            // case 'goblin':
            //     enemy = new GoblinEnemy(x, y, this.enemyIdCounter++);
            //     break;
            default:
                console.warn(`Unknown enemy type: ${enemyType}`);
                return null;
        }

        if (enemy) {
            this.enemies.push(enemy);
            return enemy;
        }
        return null;
    }

    checkCollisions(playerPos, player) {
        this.enemies.forEach(enemy => {
            if (!enemy.destroyed && enemy.checkCollision(playerPos)) {
                enemy.damagePlayer(player);
            }
        });
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.destroyed) {
                enemy.update();
            }
        });
    }

    removeDestroyedEnemies() {
        const initialCount = this.enemies.length;
        this.enemies = this.enemies.filter(enemy => !enemy.destroyed);

        if (this.enemies.length < initialCount) {
            console.log(`Removed ${initialCount - this.enemies.length} destroyed enemies`);
        }
    }

    getEnemyCount() {
        return this.enemies.length;
    }

    getAliveEnemyCount() {
        return this.enemies.filter(enemy => !enemy.destroyed).length;
    }

    getEnemies() {
        return this.enemies.filter(enemy => !enemy.destroyed);
    }

    getAllEnemies() {
        return this.enemies;
    }

    getEnemiesByType(type) {
        return this.enemies.filter(enemy => !enemy.destroyed && enemy.config.TYPE === type);
    }

    damageEnemyById(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId && !e.destroyed);
        if (enemy) {
            return enemy.takeDamage(damage);
        }
        return 0;
    }

    // Damage all enemies in a radius (for future AOE attacks)
    damageEnemiesInRadius(centerX, centerY, radius, damage) {
        let hitCount = 0;

        this.enemies.forEach(enemy => {
            if (!enemy.destroyed) {
                const dx = enemy.x - centerX;
                const dy = enemy.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    enemy.takeDamage(damage);
                    hitCount++;
                }
            }
        });

        console.log(`AOE attack hit ${hitCount} enemies`);
        return hitCount;
    }

    destroy() {
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
        this.enemyIdCounter = 0;
    }

    // Get stats for debugging
    getStats() {
        const alive = this.getAliveEnemyCount();
        const total = this.getEnemyCount();

        const enemyTypes = {};
        this.enemies.forEach(enemy => {
            if (!enemy.destroyed) {
                const type = enemy.config.TYPE;
                enemyTypes[type] = (enemyTypes[type] || 0) + 1;
            }
        });

        return {
            total: total,
            alive: alive,
            destroyed: total - alive,
            types: enemyTypes,
            enemies: this.enemies.map(enemy => ({
                id: enemy.id,
                type: enemy.config.TYPE,
                name: enemy.config.NAME,
                x: enemy.x,
                y: enemy.y,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                destroyed: enemy.destroyed
            }))
        };
    }
}

console.log('EnemyManager class loaded successfully');