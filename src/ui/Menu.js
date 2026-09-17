import { inventory } from '../game/Inventory.js';
import { story } from '../game/StoryQuest.js';
import { creditsModal } from './Credits.js';
import { sound } from '../engine/Audio.js';

export class PauseMenu {
  constructor() {
    this.isOpen = false;
    this.container = document.createElement('div');
    this.container.id = 'pause-menu';
    this.setupUI();
  }

  setupUI() {
    this.container.innerHTML = `
      <style>
        #pause-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(6, 12, 18, 0.92);
          backdrop-filter: blur(16px);
          display: none;
          flex-direction: column;
          z-index: 1000;
          color: #f1f2f6;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .menu-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .menu-title-block {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .game-logo-text {
          font-size: 20px;
          color: #2ed573;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .tabs-row {
          display: flex;
          gap: 20px;
        }

        .menu-tab {
          font-size: 15px;
          font-weight: 600;
          color: #a4b0be;
          cursor: pointer;
          padding: 6px 14px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .menu-tab.active {
          color: #2ed573;
          background: rgba(46, 213, 115, 0.15);
        }

        .menu-content {
          display: flex;
          flex: 1;
          padding: 30px 40px;
          gap: 30px;
          overflow-y: auto;
        }

        .items-grid {
          flex: 2;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s;
          position: relative;
        }

        .item-card:hover {
          transform: translateY(-2px);
          border-color: #2ed573;
        }

        .item-card.equipped {
          border-color: #2ed573;
          box-shadow: 0 0 15px rgba(46, 213, 115, 0.3);
        }

        .item-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .item-name {
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          color: #fff;
        }

        .item-stat {
          font-size: 11px;
          color: #f9ca24;
          margin-top: 4px;
        }

        .item-count {
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 11px;
          color: #7bed9f;
          font-weight: 700;
        }

        .detail-panel {
          flex: 1;
          background: rgba(14, 23, 31, 0.85);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
        }

        .detail-title {
          font-size: 20px;
          color: #7ed6df;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .detail-desc {
          font-size: 14px;
          line-height: 1.6;
          color: #ced6e0;
          flex: 1;
        }

        .fuse-action-btn {
          margin-top: 20px;
          padding: 12px;
          background: #2ed573;
          color: #071912;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .fuse-action-btn:hover {
          background: #7bed9f;
        }

        .bottom-actions {
          padding: 16px 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .credits-trigger-btn {
          background: rgba(249, 202, 36, 0.15);
          border: 1px solid #f9ca24;
          color: #f9ca24;
          padding: 8px 18px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .credits-trigger-btn:hover {
          background: rgba(249, 202, 36, 0.3);
        }

        .github-sync-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #2ed573;
        }
      </style>

      <div class="menu-topbar">
        <div class="menu-title-block">
          <div class="game-logo-text">Ganondorf Reawakened</div>
          <div class="tabs-row">
            <div class="menu-tab active" data-tab="weapons">Weapons</div>
            <div class="menu-tab" data-tab="bows">Bows & Shields</div>
            <div class="menu-tab" data-tab="staffs">Staffs</div>
            <div class="menu-tab" data-tab="materials">Materials & Fuse</div>
            <div class="menu-tab" data-tab="quests">Adventure Log</div>
          </div>
        </div>
        <button id="resume-btn" style="background:#2ed573; color:#040d09; border:none; padding:8px 24px; border-radius:6px; font-weight:700; cursor:pointer;">Resume (Tab)</button>
      </div>

      <div class="menu-content">
        <div class="items-grid" id="items-grid"></div>
        <div class="detail-panel" id="detail-panel">
          <div class="detail-title" id="detail-name">Select an Item</div>
          <div class="detail-desc" id="detail-desc">Hover or click items in your inventory to inspect their properties, attack strength, or fuse materials.</div>
          <button class="fuse-action-btn" id="fuse-btn" style="display:none;">Fuse to Equipped Weapon</button>
        </div>
      </div>

      <div class="bottom-actions">
        <button class="credits-trigger-btn" id="open-credits-btn">★ Zelda Creators Tribute</button>
        <div class="github-sync-indicator">
          <span>●</span>
          <span>GitHub: Crazy-Link67/zelda-ganandorf-reawakened</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.currentTab = 'weapons';
    this.selectedItem = null;

    // Tab buttons
    this.container.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.container.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTab = e.target.dataset.tab;
        this.renderTabContent();
      });
    });

    // Resume button
    this.container.querySelector('#resume-btn').addEventListener('click', () => {
      this.close();
    });

    // Credits modal button
    this.container.querySelector('#open-credits-btn').addEventListener('click', () => {
      creditsModal.open();
    });

    // Fuse button
    this.container.querySelector('#fuse-btn').addEventListener('click', () => {
      if (this.selectedItem && this.selectedItem.type === 'material') {
        const matIdx = inventory.materials.findIndex(m => m.id === this.selectedItem.id);
        inventory.fuseMaterialToWeapon(0, matIdx);
        sound.playFuseChime();
        this.renderTabContent();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.renderTabContent();
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  renderTabContent() {
    const grid = document.getElementById('items-grid');
    const detailName = document.getElementById('detail-name');
    const detailDesc = document.getElementById('detail-desc');
    const fuseBtn = document.getElementById('fuse-btn');
    grid.innerHTML = '';
    fuseBtn.style.display = 'none';

    if (this.currentTab === 'weapons') {
      inventory.weapons.forEach((w, idx) => {
        const isEquipped = inventory.equippedWeapon && inventory.equippedWeapon.id === w.id;
        const card = document.createElement('div');
        card.className = `item-card ${isEquipped ? 'equipped' : ''}`;
        card.innerHTML = `
          <div class="item-icon">🗡️</div>
          <div class="item-name">${w.name}</div>
          <div class="item-stat">ATK: ${w.attack} ${w.fused ? `(+${w.fused.bonus})` : ''}</div>
        `;
        card.addEventListener('click', () => {
          inventory.equipWeapon(idx);
          this.selectedItem = w;
          detailName.innerText = w.name;
          detailDesc.innerHTML = `${w.description}<br><br><strong>Attack Power:</strong> ${w.attack}<br>${w.fused ? `<strong>Fused:</strong> ${w.fused.name} (+${w.fused.bonus} ATK)` : '<em>No material fused. Go to Materials tab to fuse.</em>'}`;
          sound.playItemPickup();
          this.renderTabContent();
        });
        grid.appendChild(card);
      });
    } else if (this.currentTab === 'bows') {
      inventory.bows.forEach((b, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-icon">🏹</div>
          <div class="item-name">${b.name}</div>
          <div class="item-stat">PWR: ${b.attack}</div>
        `;
        card.addEventListener('click', () => {
          inventory.equipBow(idx);
          detailName.innerText = b.name;
          detailDesc.innerHTML = `${b.description}<br><br><strong>Attack Power:</strong> ${b.attack}`;
          sound.playItemPickup();
        });
        grid.appendChild(card);
      });

      inventory.shields.forEach((s, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-icon">🛡️</div>
          <div class="item-name">${s.name}</div>
          <div class="item-stat">DEF: ${s.defense}</div>
        `;
        card.addEventListener('click', () => {
          inventory.equipShield(idx);
          detailName.innerText = s.name;
          detailDesc.innerHTML = `${s.description}<br><br><strong>Shield Guard:</strong> ${s.defense}`;
          sound.playItemPickup();
        });
        grid.appendChild(card);
      });
    } else if (this.currentTab === 'staffs') {
      inventory.staffs.forEach((st, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-icon">🔮</div>
          <div class="item-name">${st.name}</div>
          <div class="item-stat">ATK: ${st.attack} (${st.element})</div>
        `;
        card.addEventListener('click', () => {
          inventory.equipStaff(idx);
          detailName.innerText = st.name;
          detailDesc.innerHTML = `${st.description}<br><br><strong>Attack:</strong> ${st.attack}<br><strong>Element:</strong> ${st.element}`;
          sound.playItemPickup();
        });
        grid.appendChild(card);
      });
    } else if (this.currentTab === 'materials') {
      inventory.materials.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-count">x${m.count}</div>
          <div class="item-icon">💎</div>
          <div class="item-name">${m.name}</div>
          <div class="item-stat">+${m.fuseBonus} Fuse</div>
        `;
        card.addEventListener('click', () => {
          this.selectedItem = { ...m, type: 'material' };
          detailName.innerText = m.name;
          detailDesc.innerHTML = `${m.description}<br><br><strong>Fuse Attack Bonus:</strong> +${m.fuseBonus}<br><strong>Effect:</strong> ${m.element}`;
          fuseBtn.style.display = 'block';
          sound.playItemPickup();
        });
        grid.appendChild(card);
      });
    } else if (this.currentTab === 'quests') {
      const q = story.getCurrentQuest();
      grid.innerHTML = `
        <div style="grid-column: span 3; font-size: 15px; line-height: 1.7; color: #ced6e0;">
          <h3 style="color:#f9ca24;">The Legend of Zelda: Rise of the Legends</h3>
          <p>${story.prologueText.join(' ')}</p>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
          <h4 style="color:#2ed573;">Current Objective: ${q ? q.title : 'All Quests Complete!'}</h4>
          <p>${q ? q.description : 'You have restored light to Hyrule.'}</p>
        </div>
      `;
    }
  }
}

export const pauseMenu = new PauseMenu();

