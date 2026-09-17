import * as THREE from 'three';
import { GameRenderer } from './engine/Renderer.js';
import { ThirdPersonCamera } from './engine/Camera.js';
import { input } from './engine/Input.js';
import { Player } from './game/Player.js';
import { SkyIslands } from './game/SkyIslands.js';
import { EnemyManager } from './game/Enemies.js';
import { AbilitiesManager } from './game/Abilities.js';
import { CutsceneDirector } from './game/Cutscenes.js';
import { HUD } from './ui/HUD.js';
import { pauseMenu } from './ui/Menu.js';
import { SplashScreen } from './ui/Splash.js';
import { sound } from './engine/Audio.js';
import { story } from './game/StoryQuest.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new GameRenderer(this.canvas);
    this.camera = new ThirdPersonCamera(this.canvas);

    // Abilities (Ultrahand, Fuse)
    this.abilities = new AbilitiesManager(this.renderer.scene, this.camera.camera);

    // Environment & Islands
    this.skyIslands = new SkyIslands(this.renderer.scene, this.abilities);

    // Player (Link - Grounded on Awakening Sanctuary)
    this.player = new Player(this.renderer.scene);

    // Enemies & Ganondorf Reawakened Boss
    this.enemies = new EnemyManager(this.renderer.scene);

    // Cinematic Cutscene Director
    this.cutscenes = new CutsceneDirector(this.camera, this.renderer.scene);

    // UI HUD
    this.hud = new HUD();

    // Clock
    this.clock = new THREE.Clock();
    this.gameStarted = false;

    // Splash Screen ("crazy_link67 games")
    this.splash = new SplashScreen(() => {
      this.gameStarted = true;
      // Trigger cinematic Awakening Prologue Cutscene!
      this.cutscenes.playPrologue(this.player, () => {
        input.requestPointerLock(this.canvas);
      });
    });

    // Handle clicks to lock pointer
    this.canvas.addEventListener('click', () => {
      if (this.gameStarted && !pauseMenu.isOpen && !this.cutscenes.isPlaying) {
        input.requestPointerLock(this.canvas);
      }
    });

    // Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    input.update();

    // Pause menu toggle
    if (input.inventoryPressed && !this.cutscenes.isPlaying) {
      pauseMenu.toggle();
      if (pauseMenu.isOpen) {
        input.exitPointerLock();
      } else {
        input.requestPointerLock(this.canvas);
      }
    }

    // Cutscene updates
    if (this.cutscenes.isPlaying) {
      this.cutscenes.update(delta);
    } else if (this.gameStarted && !pauseMenu.isOpen) {
      // Toggle Ultrahand with F
      if (input.ultrahandPressed) {
        this.abilities.toggleUltrahand(this.player.getHandPosition());
      }

      // Quick Fuse with Q
      if (input.fusePressed) {
        this.abilities.performFuse(0);
      }

      const camForward = this.camera.getForwardVector();
      const camRight = this.camera.getRightVector();

      // Update Player
      this.player.update(delta, input, camForward, camRight, this.skyIslands);

      // Update Camera
      this.camera.update(delta, input, this.player.position, this.player.state);

      // Update Ultrahand
      this.abilities.update(delta, input, this.player.getHandPosition(), camForward);

      // Update Enemies & Boss
      this.enemies.update(delta, this.player);

      // Update HUD
      this.hud.update(this.player, this.enemies);

      // Trigger Leap of Faith Cutscene when stepping off the diving board
      if (this.player.position.z > 26 && this.player.position.y > 115 && !this.cutscenes.hasPlayedDive) {
        this.cutscenes.playLeapOfFaith(this.player);
      }

      // Trigger Boss Cutscene when nearing Ganondorf's arena
      if (this.player.position.z > 145 && !this.cutscenes.hasPlayedBoss && this.enemies.boss) {
        this.cutscenes.playGanondorfIntro(this.enemies.boss);
      }

      // Check Quest Milestones
      if (this.player.position.y < 90 && story.currentQuestIndex === 0) {
        story.completeCurrentQuest();
        sound.playItemPickup();
      }
    }

    // Update Renderer (clouds, particles)
    this.renderer.update(delta);

    // Render Scene
    this.renderer.render(this.camera.camera);

    input.resetFrame();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
