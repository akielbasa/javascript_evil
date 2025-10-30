'use strict';

// Global Game Configuration
const GAME_CONFIG = {
    // Screen settings
    WIDTH: 1200,
    HEIGHT: 800,

    // Sprite paths
    SPRITES: {
        PLAYER: './sprites/player_r.png'
    }
};

// DOM element references (will be populated in game.js)
const DOM = {
    playerDiv: null,
    positionDiv: null,
    speedDiv: null,
    healthBar: null,
    healthFill: null
};