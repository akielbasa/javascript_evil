'use strict';

console.log('🔍 Starting detailed debug...');

// Check each script one by one
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM loaded, running debug checks...');

    setTimeout(() => {
        console.log('=== DETAILED SCRIPT DEBUG ===');

        // Check LittleJS
        console.log('LittleJS EngineObject:', typeof EngineObject);
        console.log('LittleJS vec2:', typeof vec2);
        console.log('LittleJS keyIsDown:', typeof keyIsDown);

        // Check our classes
        console.log('GAME_CONFIG:', typeof GAME_CONFIG);
        console.log('DOM:', typeof DOM);
        console.log('PLAYER_CONFIG:', typeof PLAYER_CONFIG);
        console.log('BaseItem:', typeof BaseItem);
        console.log('HealthItem:', typeof HealthItem);
        console.log('ItemManager:', typeof ItemManager);
        console.log('Inventory:', typeof Inventory);
        console.log('BaseEnemy:', typeof BaseEnemy);
        console.log('ZombieEnemy:', typeof ZombieEnemy);
        console.log('EnemyManager:', typeof EnemyManager);
        console.log('Player:', typeof Player);

        console.log('=== END DEBUG ===');

        if (typeof Player !== 'undefined') {
            console.log('✅ Player class found! Proceeding with game initialization...');
            // Your regular game init code here
            initializeGame();
        } else {
            console.error('❌ Player class still not found after debug');
            console.error('Check that all scripts loaded in correct order');
        }
    }, 500);
});

function initializeGame() {
    console.log('🎮 Starting game...');
    engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
}

function gameInit() {
    console.log('Game initializing...');
    // Add your game init code here when Player is working
}

function gameUpdate() {}
function gameUpdatePost() {}
function gameRender() {}
function gameRenderPost() {}
function gameStart() {}