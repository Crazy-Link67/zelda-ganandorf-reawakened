import { inventory } from '../game/Inventory.js';
import { story } from '../game/StoryQuest.js';

export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud-layer';
    this.setupUI();
  }

  setupUI() {
    this.container.innerHTML = `
      <style>
        #hud-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 100;
          font-family: 'Segoe UI', system-ui, sans-serif;
          user-select: none;
        }

        /* Hearts Container - Top Left */
        .hearts-container {
          position: absolute;
          top: 24px;
          left: 30px;
          display: flex;
          gap: 6px;
        }

        .heart-icon {
          width: 26px;
          height: 26px;
          background: #ff4757;
          clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
          transform: scale(1.1);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
          transition: background 0.3s;
        }

        .heart-empty {
          background: #333940 !important;
          opacity: 0.6;
        }

        /* Stamina Canvas - Centered around screen or player */
        #stamina-canvas {
          position: absolute;
          top: 50%;
          left: 55%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* Reticle / Aim Crosshair */
        #crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          display: none;
          pointer-events: none;
        }

        .crosshair-dot {
          width: 6px;
          height: 6px;
          background: #2ed573;
          border-radius: 50%;
          position: absolute;
          top: 9px;
          left: 9px;
          box-shadow: 0 0 8px #2ed573;
        }

        .crosshair-ring {
          width: 24px;
          height: 24px;
          border: 1.5px solid rgba(46, 213, 115, 0.7);
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
        }

        /* Quest Tracker - Top Right */
        .quest-tracker {
          position: absolute;
          top: 24px;
          right: 30px;
          background: rgba(14, 23, 31, 0.75);
          backdrop-filter: blur(8px);
          border-left: 3px solid #2ed573;
          padding: 12px 20px;
          border-radius: 4px;
          max-width: 320px;
          color: #f1f2f6;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        }

        .quest-label {
          font-size: 11px;
          letter-spacing: 2px;
          color: #f9ca24;
          text-transform: uppercase;
        }

        .quest-title {
          font-size: 15px;
          font-weight: 700;
          margin-top: 2px;
          color: #ffffff;
        }

        .quest-desc {
          font-size: 12px;
          color: #a4b0be;
          margin-top: 4px;
          line-height: 1.4;
        }

        /* Boss Bar - Center Top */
        #boss-bar-container {
          position: absolute;
          top: 75px;
          left: 50%;
          transform: translateX(-50%);
          width: 520px;
          display: none;
          flex-direction: column;
          align-items: center;
        }

        .boss-name {
          font-size: 16px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #eb2f06;
          text-shadow: 0 0 10px rgba(235, 47, 6, 0.8);
          font-weight: 700;
          margin-bottom: 6px;
        }

        .boss-bar-outer {
          width: 100%;
          height: 12px;
          background: rgba(0, 0, 0, 0.7);
          border: 1.5px solid #eb2f06;
          border-radius: 3px;
          overflow: hidden;
          box-shadow: 0 0 14px rgba(235, 47, 6, 0.4);
        }

        .boss-bar-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #ff4757, #eb2f06);
          transition: width 0.2s ease-out;
        }

        /* Equipped Weapon & Ability Banner - Bottom Right */
        .equip-card {
          position: absolute;
          bottom: 24px;
          right: 30px;
          background: rgba(14, 23, 31, 0.75);
          backdrop-filter: blur(8px);
          padding: 10px 18px;
          border-radius: 6px;
          border-right: 3px solid #7ed6df;
          color: #fff;
          text-align: right;
          font-size: 13px;
        }

        .weapon-name {
          font-weight: 700;
          color: #7ed6df;
          font-size: 15px;
        }

        .fused-badge {
          display: inline-block;
          background: rgba(46, 213, 115, 0.25);
          border: 1px solid #2ed573;
          color: #2ed573;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          margin-top: 4px;
        }

        /* Controls Hint Bar - Bottom Center */
        .controls-hint {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #a4b0be;
          background: rgba(8, 14, 20, 0.65);
          backdrop-filter: blur(6px);
          padding: 6px 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .key-tag {
          background: rgba(255, 255, 255, 0.15);
          color: #f1f2f6;
          padding: 1px 6px;
          border-radius: 3px;
          font-weight: 600;
        }
      </style>

      <!-- Hearts -->
      <div class="hearts-container" id="hearts-box">
        <div class="heart-icon"></div>
        <div class="heart-icon"></div>
        <div class="heart-icon"></div>
        <div class="heart-icon"></div>
        <div class="heart-icon"></div>
      </div>

      <!-- Stamina Canvas -->
      <canvas id="stamina-canvas" width="80" height="80"></canvas>

      <!-- Aiming Crosshair -->
      <div id="crosshair">
        <div class="crosshair-ring"></div>
        <div class="crosshair-dot"></div>
      </div>

      <!-- Quest Objective -->
      <div class="quest-tracker">
        <div class="quest-label">Active Quest</div>
        <div class="quest-title" id="quest-title">Step of Faith</div>
        <div class="quest-desc" id="quest-desc">Leap off the Great Sky Island diving ledge!</div>
      </div>

      <!-- Boss Health Bar -->
      <div id="boss-bar-container">
        <div class="boss-name" id="boss-name">Demon King Ganondorf - Reawakened Malice</div>
        <div class="boss-bar-outer">
          <div class="boss-bar-fill" id="boss-bar-fill"></div>
        </div>
      </div>

      <!-- Equipped Item Card -->
      <div class="equip-card">
        <div class="weapon-name" id="hud-weapon-name">Decayed Master Sword</div>
        <div id="hud-fuse-box" style="display:none;"><span class="fused-badge" id="hud-fuse-name">Fused: Fire Fruit (+12)</span></div>
        <div style="font-size: 11px; color: #a4b0be; margin-top: 2px;">Arrows: <span id="hud-arrow-count" style="color:#2ed573; font-weight:700;">30</span> | ATK: <span id="hud-atk-power" style="color:#f9ca24;">30</span></div>
      </div>

      <!-- Controls Hint -->
      <div class="controls-hint">
        <div><span class="key-tag">WASD</span> Move</div>
        <div><span class="key-tag">Shift</span> Sprint</div>
        <div><span class="key-tag">Space</span> Jump / Glider</div>
        <div><span class="key-tag">L-Click</span> Attack</div>
        <div><span class="key-tag">R-Click</span> Aim Bow</div>
        <div><span class="key-tag">F</span> Ultrahand</div>
        <div><span class="key-tag">Q</span> Fuse</div>
        <div><span class="key-tag">Tab</span> Menu</div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.staminaCanvas = document.getElementById('stamina-canvas');
    this.staminaCtx = this.staminaCanvas.getContext('2d');
    this.crosshair = document.getElementById('crosshair');
    this.bossBarContainer = document.getElementById('boss-bar-container');
    this.bossBarFill = document.getElementById('boss-bar-fill');
    this.bossName = document.getElementById('boss-name');
  }

  update(player, enemies) {
    // Update Hearts
    const hearts = document.querySelectorAll('.heart-icon');
    const fullHeartsCount = Math.ceil(player.health / 20);
    hearts.forEach((h, idx) => {
      if (idx < fullHeartsCount) {
        h.classList.remove('heart-empty');
      } else {
        h.classList.add('heart-empty');
      }
    });

    // Update Stamina Wheel (Circular arc green/red)
    this.drawStaminaWheel(player.stamina, player.maxStamina, player.staminaExhausted);

    // Crosshair visibility when aiming
    if (player.state === 'aiming') {
      this.crosshair.style.display = 'block';
    } else {
      this.crosshair.style.display = 'none';
    }

    // Active Quest info
    const currentQuest = story.getCurrentQuest();
    if (currentQuest) {
      document.getElementById('quest-title').innerText = currentQuest.title;
      document.getElementById('quest-desc').innerText = currentQuest.description;
    }

    // Equipped Weapon & Stats
    const weapon = inventory.equippedWeapon;
    if (weapon) {
      document.getElementById('hud-weapon-name').innerText = weapon.name;
      const fuseBox = document.getElementById('hud-fuse-box');
      if (weapon.fused) {
        fuseBox.style.display = 'block';
        document.getElementById('hud-fuse-name').innerText = `Fused: ${weapon.fused.name} (+${weapon.fused.bonus})`;
      } else {
        fuseBox.style.display = 'none';
      }
      document.getElementById('hud-atk-power').innerText = inventory.getCurrentAttackPower();
    }
    document.getElementById('hud-arrow-count').innerText = inventory.arrows;

    // Boss Bar Update
    const activeBoss = enemies.getActiveBoss();
    if (activeBoss && activeBoss.position.distanceTo(player.position) < 65) {
      this.bossBarContainer.style.display = 'flex';
      this.bossName.innerText = activeBoss.name;
      const pct = Math.max(0, (activeBoss.health / activeBoss.maxHealth) * 100);
      this.bossBarFill.style.width = `${pct}%`;
    } else {
      this.bossBarContainer.style.display = 'none';
    }
  }

  drawStaminaWheel(current, max, exhausted) {
    const ctx = this.staminaCtx;
    ctx.clearRect(0, 0, 80, 80);

    // If stamina is 100% full and not exhausted, hide stamina wheel
    if (current >= max && !exhausted) return;

    const centerX = 40;
    const centerY = 40;
    const radius = 26;
    const pct = Math.min(1.0, Math.max(0, current / max));
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * pct);

    // Background wheel ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Foreground stamina fill
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = exhausted || pct < 0.2 ? '#eb4d4b' : '#2ed573';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

