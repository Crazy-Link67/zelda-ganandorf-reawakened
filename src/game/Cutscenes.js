import * as THREE from 'three';
import { sound } from '../engine/Audio.js';

export class CutsceneDirector {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.isPlaying = false;
    this.currentCutscene = null;
    this.cutsceneTime = 0;
    this.duration = 0;
    this.onComplete = null;

    this.hasPlayedPrologue = false;
    this.hasPlayedDive = false;
    this.hasPlayedBoss = false;

    this.setupUI();
  }

  setupUI() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'cutscene-overlay';
    this.overlay.innerHTML = `
      <style>
        #cutscene-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 5000;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Cinzel', 'Segoe UI', serif;
        }

        .letterbox-bar {
          width: 100vw;
          height: 12vh;
          background: #030709;
          transition: height 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .cutscene-center-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 30px;
        }

        .cutscene-subtitles {
          background: rgba(8, 14, 20, 0.78);
          backdrop-filter: blur(10px);
          padding: 14px 28px;
          border-radius: 8px;
          border: 1px solid rgba(46, 213, 115, 0.3);
          color: #f1f2f6;
          font-size: 18px;
          letter-spacing: 1.5px;
          max-width: 850px;
          text-align: center;
          line-height: 1.5;
          text-shadow: 0 0 10px rgba(46, 213, 115, 0.5);
          transition: opacity 0.4s;
        }

        .cinematic-title-card {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: fadeInOut 4s ease-in-out forwards;
        }

        .cinematic-main-title {
          font-size: 34px;
          color: #f5f6fa;
          letter-spacing: 5px;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }

        .cinematic-sub-title {
          font-size: 24px;
          color: #eb2f06;
          letter-spacing: 4px;
          margin-top: 8px;
          text-shadow: 0 0 20px rgba(235, 47, 6, 0.9);
        }

        .skip-cutscene-hint {
          position: absolute;
          bottom: 24px;
          right: 32px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 12px;
          letter-spacing: 1px;
          font-family: 'Segoe UI', sans-serif;
        }
      </style>

      <div class="letterbox-bar"></div>

      <div class="cutscene-center-content">
        <div class="cinematic-title-card" id="cutscene-title-card">
          <div class="cinematic-main-title" id="cutscene-title-text">THE LEGEND OF ZELDA</div>
          <div class="cinematic-sub-title" id="cutscene-subtitle-text">GANONDORF REAWAKENED</div>
        </div>
        <div class="cutscene-subtitles" id="cutscene-subtitles">...</div>
      </div>

      <div class="letterbox-bar"></div>
      <div class="skip-cutscene-hint">[SPACE / ESC] to Skip</div>
    `;

    document.body.appendChild(this.overlay);

    this.subtitlesEl = document.getElementById('cutscene-subtitles');
    this.titleCard = document.getElementById('cutscene-title-card');
    this.titleText = document.getElementById('cutscene-title-text');
    this.subtitleText = document.getElementById('cutscene-subtitle-text');

    // Skip listener
    window.addEventListener('keydown', (e) => {
      if (this.isPlaying && (e.code === 'Space' || e.code === 'Escape')) {
        this.finish();
      }
    });
  }

  playPrologue(player, onDone) {
    if (this.hasPlayedPrologue) {
      if (onDone) onDone();
      return;
    }
    this.hasPlayedPrologue = true;
    this.isPlaying = true;
    this.currentCutscene = 'prologue';
    this.cutsceneTime = 0;
    this.duration = 14.0;
    this.onComplete = onDone;
    this.player = player;

    this.overlay.style.display = 'flex';
    this.titleCard.style.display = 'none';

    // Cinematic dialogue steps
    this.dialogueSteps = [
      { time: 0.5, text: "Princess Zelda: 'Link... Link... Open your eyes...'" },
      { time: 3.5, text: "A cataclysmic gloom shattered the Master Sword deep beneath Hyrule." },
      { time: 7.0, text: "Demon King Ganondorf has reawakened in wrath, breaking the sacred seal." },
      { time: 10.5, text: "The ancient power of the Zonai now resides in your right arm. Find me..." }
    ];

    sound.playSplashJingle();
  }

  playLeapOfFaith(player, onDone) {
    if (this.hasPlayedDive) {
      if (onDone) onDone();
      return;
    }
    this.hasPlayedDive = true;
    this.isPlaying = true;
    this.currentCutscene = 'dive';
    this.cutsceneTime = 0;
    this.duration = 4.0;
    this.onComplete = onDone;
    this.player = player;

    this.overlay.style.display = 'flex';
    this.subtitlesEl.innerHTML = "<span style='color:#7bed9f; font-weight:700;'>PRESS [SPACE]</span> TO DEPLOY YOUR PARAGLIDER!";
    sound.playGliderDeploy();
  }

  playGanondorfIntro(boss, onDone) {
    if (this.hasPlayedBoss) {
      if (onDone) onDone();
      return;
    }
    this.hasPlayedBoss = true;
    this.isPlaying = true;
    this.currentCutscene = 'boss';
    this.cutsceneTime = 0;
    this.duration = 6.0;
    this.onComplete = onDone;
    this.boss = boss;

    this.overlay.style.display = 'flex';
    this.titleCard.style.display = 'flex';
    this.titleText.innerText = "DEMON KING GANONDORF";
    this.subtitleText.innerText = "REAWAKENED MALICE";
    this.subtitlesEl.innerText = "Ganondorf: 'Witness the true king of this world...'";
    sound.playSwordSlash();
  }

  update(delta) {
    if (!this.isPlaying) return;

    this.cutsceneTime += delta;

    if (this.currentCutscene === 'prologue') {
      // Sweeping camera starting high over sky islands down to Link
      const progress = Math.min(1.0, this.cutsceneTime / this.duration);

      // Camera coordinates interpolation
      const startCam = new THREE.Vector3(0, 150, 40);
      const endCam = new THREE.Vector3(0, 126, 4.5);
      this.camera.camera.position.lerpVectors(startCam, endCam, Math.pow(progress, 0.7));
      this.camera.camera.lookAt(0, 124.8, 0);

      // Subtitle updates
      for (const step of this.dialogueSteps) {
        if (this.cutsceneTime >= step.time) {
          this.subtitlesEl.innerText = step.text;
        }
      }

      if (this.cutsceneTime >= 7.5 && this.cutsceneTime <= 11.5) {
        this.titleCard.style.display = 'flex';
        this.titleText.innerText = "THE LEGEND OF ZELDA: RISE OF THE LEGENDS";
        this.subtitleText.innerText = "GANONDORF REAWAKENED";
      } else {
        this.titleCard.style.display = 'none';
      }

      if (this.cutsceneTime >= this.duration) {
        this.finish();
      }
    } else if (this.currentCutscene === 'dive') {
      // Front-facing dynamic dive camera
      if (this.player) {
        const camPos = this.player.position.clone().add(new THREE.Vector3(0, -1.8, 6));
        this.camera.camera.position.lerp(camPos, delta * 8);
        this.camera.camera.lookAt(this.player.position);
      }

      if (this.cutsceneTime >= this.duration) {
        this.finish();
      }
    } else if (this.currentCutscene === 'boss') {
      if (this.boss) {
        const camPos = this.boss.position.clone().add(new THREE.Vector3(0, 2.5, 7.5));
        this.camera.camera.position.lerp(camPos, delta * 6);
        this.camera.camera.lookAt(this.boss.position.clone().add(new THREE.Vector3(0, 1.8, 0)));
      }

      if (this.cutsceneTime >= this.duration) {
        this.finish();
      }
    }
  }

  finish() {
    this.isPlaying = false;
    this.overlay.style.display = 'none';
    if (this.onComplete) {
      this.onComplete();
      this.onComplete = null;
    }
  }
}

