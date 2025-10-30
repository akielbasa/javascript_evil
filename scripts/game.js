'use strict';

// Game objects
let player;
let itemManager;
let enemyManager;
let gameStats = {
    startTime: 0,
    itemsCollected: 0,
    damageDealt: 0,
    damageTaken: 0,
    enemiesKilled: 0
};

// Game state
let gameRunning = false;

// Helper function for enemies to get player position
window.getPlayerPosition = function() {
    if (player && !player.isDead) {
        return { x: player.pos.x, y: player.pos.y };
    }
    return null;
};

// Victory functionality
function showVictoryScreen() {
    const victoryScreen = document.getElementById('victoryScreen');
    const finalVictoryStats = document.getElementById('finalVictoryStats');

    if (victoryScreen && finalVictoryStats) {
        const survivalTime = ((Date.now() - gameStats.startTime) / 1000).toFixed(1);

        finalVictoryStats.innerHTML = `
            <div>🎉 <strong>VICTORY!</strong> 🎉</div>
            <div>You survived for <strong>${survivalTime} seconds</strong></div>
            <div>Items collected: <strong>${gameStats.itemsCollected}</strong></div>
            <div>Enemies defeated: <strong>${gameStats.enemiesKilled}</strong></div>
            <div>Damage dealt: <strong>${gameStats.damageDealt}</strong></div>
        `;

        victoryScreen.classList.add('visible');
        gameRunning = false;

        console.log('🏆 Victory screen displayed');
    }
}

function hideVictoryScreen() {
    const victoryScreen = document.getElementById('victoryScreen');
    if (victoryScreen) {
        victoryScreen.classList.remove('visible');
    }
}

// Game Over functionality
function showGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalStats = document.getElementById('finalStats');

    if (gameOverScreen && finalStats) {
        const survivalTime = ((Date.now() - gameStats.startTime) / 1000).toFixed(1);

        finalStats.innerHTML = `
            <div>You survived for <strong>${survivalTime} seconds</strong></div>
            <div>Items collected: <strong>${gameStats.itemsCollected}</strong></div>
            <div>Enemies defeated: <strong>${gameStats.enemiesKilled}</strong></div>
            <div>Damage taken: <strong>${gameStats.damageTaken}</strong></div>
        `;

        gameOverScreen.classList.add('visible');
        gameRunning = false;

        console.log('💀 Game Over screen displayed');
    }
}

function hideGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        gameOverScreen.classList.remove('visible');
    }
}

function resetGameStats() {
    gameStats = {
        startTime: Date.now(),
        itemsCollected: 0,
        damageDealt: 0,
        damageTaken: 0,
        enemiesKilled: 0
    };
}

function restartGame() {
    console.log('🔄 Restarting game...');

    hideGameOverScreen();
    hideVictoryScreen();

    resetGameStats();

    if (itemManager) {
        itemManager.destroy();
    }
    if (enemyManager) {
        enemyManager.destroy();
    }

    if (player) {
        player.reset(vec2(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2));
    }

    itemManager = new ItemManager();
    itemManager.createHealthItems();

    enemyManager = new EnemyManager();
    enemyManager.createEnemies();

    gameRunning = true;

    console.log('✅ Game restarted successfully');
}

function checkVictoryCondition() {
    if (enemyManager && gameRunning) {
        const aliveEnemies = enemyManager.getAliveEnemyCount();
        if (aliveEnemies === 0) {
            console.log('🏆 All enemies defeated! Victory!');
            setTimeout(() => {
                showVictoryScreen();
            }, 1000);
            return true;
        }
    }
    return false;
}

// Player attack callback
window.onPlayerAttack = function(playerPos, attackRange, attackDamage) {
    if (!enemyManager || !gameRunning) return 0;

    let hitCount = 0;
    const enemies = enemyManager.getEnemies();

    enemies.forEach(enemy => {
        const distance = Math.sqrt(
            Math.pow(enemy.x - playerPos.x, 2) +
            Math.pow(enemy.y - playerPos.y, 2)
        );

        if (distance <= attackRange) {
            const damageDealt = enemy.takeDamage(attackDamage);
            if (damageDealt > 0) {
                gameStats.damageDealt += damageDealt;
                hitCount++;

                if (enemy.isDestroyed()) {
                    gameStats.enemiesKilled++;
                }
            }
        }
    });

    if (hitCount > 0) {
        setTimeout(checkVictoryCondition, 100);
    }

    return hitCount;
};

// Player death callback
window.onPlayerDeath = function() {
    console.log('🔔 Player death callback triggered');
    showGameOverScreen();
};

// Wait for all scripts to load before initializing
function initializeGame() {
    console.log('🎮 Starting initialization...');

    // Check if Player class is loaded
    if (typeof Player === 'undefined') {
        console.error('❌ Player class not found!');
        return;
    }

    console.log('✅ Player class found!');

    // Setup restart and continue buttons
    const restartButton = document.getElementById('restartButton');
    const continueButton = document.getElementById('continueButton');

    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }

    if (continueButton) {
        continueButton.addEventListener('click', restartGame);
    }

    // Initialize LittleJS engine
    engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
}

// Game initialization
function gameInit() {
    console.log('🎮 gameInit() called');

    canvasFixedSize = vec2(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    cameraPos = vec2(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2);
    cameraScale = 1;

    resetGameStats();

    console.log('Creating player...');
    player = new Player(vec2(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2));

    console.log('Creating items...');
    itemManager = new ItemManager();
    itemManager.createHealthItems();

    console.log('Creating enemies...');
    enemyManager = new EnemyManager();
    enemyManager.createEnemies();

    player.updateHealthBar();

    hideCanvases();

    gameRunning = true;

    console.log('🎮 Game initialized with moving zombies!');
    console.log('🧟 Zombies will move at 1/3 player speed (100 pixels/second)');
}

function hideCanvases() {
    setTimeout(() => {
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach((canvas) => {
            canvas.style.display = 'none';
        });
    }, 100);
}

// Game loop functions
function gameUpdate() {
    if (!gameRunning) return;

    // Check for item pickups
    if (player && itemManager) {
        itemManager.checkPickups(player.pos, player.inventory);
    }

    // Check for enemy collisions - IMPORTANT: Check invulnerability correctly
    if (player && enemyManager) {
        // Only prevent damage if player is currently invulnerable (during attack)
        // Don't check isInvulnerable here - let the enemy's damage cooldown handle it
        const oldHealth = player.health;
        enemyManager.checkCollisions(player.pos, player);
        const damageTaken = oldHealth - player.health;
        if (damageTaken > 0) {
            gameStats.damageTaken += damageTaken;
        }
    }

    // Update enemies
    if (enemyManager) {
        enemyManager.updateEnemies();
    }
}

function gameUpdatePost() {
    if (!gameRunning) return;

    if (itemManager) {
        itemManager.removeCollectedItems();
    }

    if (enemyManager) {
        enemyManager.removeDestroyedEnemies();
    }
}

function gameRender() {
    // Canvas rendering
}

function gameRenderPost() {
    // Post-render effects
}

function gameStart() {
    console.log('🚀 Game started with moving zombies!');
}

// Utility functions
function damagePlayer(amount) {
    if (player) {
        player.takeDamage(amount);
    }
}

function healPlayer(amount) {
    if (player) {
        player.heal(amount);
    }
}

function spawnHealthItem(x, y) {
    if (itemManager) {
        const item = itemManager.createItem('health', x, y);
        if (item) {
            console.log(`Spawned health item at ${x}, ${y}`);
        }
    }
}

function spawnZombie(x, y) {
    if (enemyManager) {
        const zombie = enemyManager.createEnemy('zombie', x, y);
        if (zombie) {
            console.log(`Spawned zombie at ${x}, ${y}`);
            return zombie;
        }
    }
}

function killAllEnemies() {
    if (enemyManager) {
        const enemies = enemyManager.getAllEnemies();
        enemies.forEach(enemy => {
            if (!enemy.isDestroyed()) {
                enemy.takeDamage(9999);
            }
        });
        console.log('💀 All enemies killed');
    }
}

function getCurrentGameStats() {
    const survivalTime = gameRunning ? ((Date.now() - gameStats.startTime) / 1000).toFixed(1) : 0;

    const stats = {
        player: {
            health: player ? player.health : 0,
            maxHealth: player ? player.maxHealth : 0,
            position: player ? { x: player.pos.x, y: player.pos.y } : null,
            isDead: player ? player.isDead : false,
            isAttacking: player ? player.isAttacking : false,
            isInvulnerable: player ? player.isInvulnerable : false
        },
        enemies: enemyManager ? enemyManager.getStats() : null,
        gameStats: {
            ...gameStats,
            survivalTime: survivalTime,
            gameRunning: gameRunning
        }
    };

    console.log('📊 Game Stats:', stats);
    return stats;
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM loaded, initializing game...');
    setTimeout(initializeGame, 500);
});

console.log('✅ game.js loaded');