// Acknowledgment & Tribute Modal for Zelda Creators
export class CreditsModal {
  constructor() {
    this.modal = document.createElement('div');
    this.modal.id = 'credits-modal';
    this.setupUI();
  }

  setupUI() {
    this.modal.innerHTML = `
      <style>
        #credits-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(4, 9, 14, 0.88);
          backdrop-filter: blur(14px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 20000;
          color: #f1f2f6;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .credits-card {
          background: linear-gradient(135deg, rgba(17, 29, 39, 0.95), rgba(7, 14, 20, 0.98));
          border: 2px solid rgba(46, 213, 115, 0.5);
          box-shadow: 0 0 50px rgba(46, 213, 115, 0.25);
          border-radius: 16px;
          max-width: 640px;
          width: 90%;
          padding: 36px 40px;
          text-align: center;
          position: relative;
        }

        .credits-header {
          font-size: 26px;
          color: #2ed573;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .credits-sub {
          font-size: 14px;
          color: #f9ca24;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        .credits-body {
          font-size: 15px;
          line-height: 1.65;
          color: #ced6e0;
          margin-bottom: 24px;
          text-align: left;
        }

        .creator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin: 20px 0;
          text-align: left;
        }

        .creator-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 8px;
          border-left: 3px solid #2ed573;
        }

        .creator-name {
          font-weight: 700;
          color: #ffffff;
          font-size: 14px;
        }

        .creator-role {
          font-size: 12px;
          color: #7bed9f;
        }

        .close-credits-btn {
          margin-top: 10px;
          padding: 10px 32px;
          background: #2ed573;
          color: #0c1c14;
          font-weight: 700;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 15px;
          transition: transform 0.2s, background 0.2s;
        }

        .close-credits-btn:hover {
          background: #7bed9f;
          transform: scale(1.04);
        }
      </style>

      <div class="credits-card">
        <div class="credits-header">Honoring The Zelda Creators</div>
        <div class="credits-sub">A Heartfelt Tribute to the Pioneers of Hyrule</div>

        <div class="credits-body">
          <em>The Legend of Zelda: Rise of the Legends – Ganondorf Reawakened</em> is a fan PC engine homage inspired by the masterpiece <strong>The Legend of Zelda: Tears of the Kingdom</strong>. We extend our deepest admiration and gratitude to the legendary creators at Nintendo who shaped our imaginations:
        </div>

        <div class="creator-grid">
          <div class="creator-card">
            <div class="creator-name">Shigeru Miyamoto</div>
            <div class="creator-role">Original Creator of The Legend of Zelda</div>
          </div>
          <div class="creator-card">
            <div class="creator-name">Eiji Aonuma</div>
            <div class="creator-role">Series Producer & Visionary</div>
          </div>
          <div class="creator-card">
            <div class="creator-name">Hidemaro Fujibayashi</div>
            <div class="creator-role">Director of Tears of the Kingdom</div>
          </div>
          <div class="creator-card">
            <div class="creator-name">Koji Kondo</div>
            <div class="creator-role">Legendary Composer & Sound Director</div>
          </div>
          <div class="creator-card" style="grid-column: span 2;">
            <div class="creator-name">Nintendo EPD Kyoto Development Team</div>
            <div class="creator-role">Art, Physics, Shaders, Sound, Mechanics & World Design</div>
          </div>
        </div>

        <div style="font-size: 13px; color: #a4b0be; margin-bottom: 20px;">
          Developed with admiration by <strong>crazy_link67 games</strong>. The Legend of Zelda and all related characters and designs are trademarks & copyrights of Nintendo.
        </div>

        <button class="close-credits-btn" id="close-credits">Return to Game</button>
      </div>
    `;

    document.body.appendChild(this.modal);

    const closeBtn = this.modal.querySelector('#close-credits');
    closeBtn.addEventListener('click', () => {
      this.close();
    });
  }

  open() {
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
  }
}

export const creditsModal = new CreditsModal();

