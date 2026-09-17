import { sound } from '../engine/Audio.js';

export class SplashScreen {
  constructor(onStart) {
    this.onStart = onStart;
    this.container = document.createElement('div');
    this.container.id = 'splash-screen';
    this.setupUI();
  }

  setupUI() {
    this.container.innerHTML = `
      <style>
        #splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, #0f1c24 0%, #030709 100%);
          color: #f1f2f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          font-family: 'Cinzel', 'Segoe UI', serif;
          cursor: pointer;
          user-select: none;
          transition: opacity 1.2s ease, visibility 1.2s ease;
        }

        .zonai-rune-ring {
          width: 190px;
          height: 190px;
          border: 3px dashed #2ed573;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spinRune 24s linear infinite;
          box-shadow: 0 0 45px rgba(46, 213, 115, 0.45);
        }

        .inner-triforce {
          width: 0;
          height: 0;
          border-left: 36px solid transparent;
          border-right: 36px solid transparent;
          border-bottom: 60px solid #f9ca24;
          filter: drop-shadow(0 0 16px rgba(249, 202, 36, 0.8));
          animation: pulseGold 2.5s ease-in-out infinite;
        }

        .studio-title {
          margin-top: 36px;
          font-size: 32px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: #2ed573;
          text-shadow: 0 0 20px rgba(46, 213, 115, 0.7);
          font-weight: 700;
        }

        .game-title {
          margin-top: 14px;
          font-size: 26px;
          letter-spacing: 3px;
          color: #f5f6fa;
          text-align: center;
          max-width: 800px;
          line-height: 1.4;
          text-shadow: 0 0 14px rgba(255, 255, 255, 0.35);
        }

        .subtitle-reawakened {
          display: block;
          color: #eb2f06;
          font-size: 20px;
          margin-top: 6px;
          letter-spacing: 4px;
          text-shadow: 0 0 16px rgba(235, 47, 6, 0.8);
        }

        .start-prompt {
          margin-top: 50px;
          font-size: 18px;
          letter-spacing: 2px;
          color: #a4b0be;
          animation: blinkPrompt 1.8s infinite;
          padding: 12px 28px;
          border: 1px solid rgba(46, 213, 115, 0.4);
          border-radius: 30px;
          background: rgba(46, 213, 115, 0.08);
          backdrop-filter: blur(8px);
        }

        @keyframes spinRune {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulseGold {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(249, 202, 36, 0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 24px rgba(249, 202, 36, 1.0)); }
        }

        @keyframes blinkPrompt {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      </style>

      <div class="zonai-rune-ring">
        <div class="inner-triforce"></div>
      </div>

      <div class="studio-title">crazy_link67 games</div>
      
      <div class="game-title">
        The Legend of Zelda
        <div style="font-size: 20px; color: #7ed6df; margin-top: 4px;">Rise of the Legends</div>
        <span class="subtitle-reawakened">GANONDORF REAWAKENED</span>
      </div>

      <div class="start-prompt">CLICK OR PRESS ANY KEY TO AWAKEN</div>
    `;

    document.body.appendChild(this.container);

    const startHandler = () => {
      sound.playSplashJingle();
      sound.startSkyAmbientMusic();
      this.container.style.opacity = '0';
      setTimeout(() => {
        this.container.style.display = 'none';
        if (this.onStart) this.onStart();
      }, 1200);
      window.removeEventListener('keydown', startHandler);
      this.container.removeEventListener('click', startHandler);
    };

    window.addEventListener('keydown', startHandler, { once: true });
    this.container.addEventListener('click', startHandler, { once: true });
  }
}

