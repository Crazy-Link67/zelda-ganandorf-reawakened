// Input manager supporting Keyboard, Mouse, and Gamepad
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      leftDown: false,
      rightDown: false,
      leftClicked: false,
      rightClicked: false,
      wheel: 0,
      isLocked: false
    };
    this.gamepad = null;
    this.interactPressed = false;
    this.ultrahandPressed = false;
    this.fusePressed = false;
    this.jumpPressed = false;
    this.inventoryPressed = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE') this.interactPressed = true;
      if (e.code === 'KeyF') this.ultrahandPressed = true;
      if (e.code === 'KeyQ') this.fusePressed = true;
      if (e.code === 'Space') this.jumpPressed = true;
      if (e.code === 'Tab') {
        e.preventDefault();
        this.inventoryPressed = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.leftDown = true;
        this.mouse.leftClicked = true;
      } else if (e.button === 2) {
        this.mouse.rightDown = true;
        this.mouse.rightClicked = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.mouse.dx += e.movementX;
        this.mouse.dy += e.movementY;
      } else {
        // Free mouse
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    });

    window.addEventListener('wheel', (e) => {
      this.mouse.wheel += Math.sign(e.deltaY);
    }, { passive: true });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent right-click context menu in game
    });

    document.addEventListener('pointerlockchange', () => {
      this.mouse.isLocked = !!document.pointerLockElement;
    });
  }

  requestPointerLock(element) {
    if (!document.pointerLockElement && element) {
      element.requestPointerLock().catch(() => {});
    }
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  update() {
    // Poll gamepad if available
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.gamepad = gamepads[0] || null;

    if (this.gamepad) {
      // Gamepad buttons: 0 = A (Jump), 1 = B (Sprint), 2 = X (Attack), 3 = Y
      if (this.gamepad.buttons[0]?.pressed) this.jumpPressed = true;
      if (this.gamepad.buttons[2]?.pressed) this.mouse.leftClicked = true;
      if (this.gamepad.buttons[5]?.pressed) this.mouse.rightDown = true; // RB
    }
  }

  resetFrame() {
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    this.mouse.leftClicked = false;
    this.mouse.rightClicked = false;
    this.mouse.wheel = 0;
    this.interactPressed = false;
    this.ultrahandPressed = false;
    this.fusePressed = false;
    this.jumpPressed = false;
    this.inventoryPressed = false;
  }

  getMoveVector() {
    let forward = 0;
    let right = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) right -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) right += 1;

    // Check gamepad left stick
    if (this.gamepad) {
      const stickX = this.gamepad.axes[0] || 0;
      const stickY = this.gamepad.axes[1] || 0;
      if (Math.abs(stickX) > 0.15) right += stickX;
      if (Math.abs(stickY) > 0.15) forward -= stickY;
    }

    return { forward, right };
  }

  isSprinting() {
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) return true;
    if (this.gamepad && this.gamepad.buttons[1]?.pressed) return true;
    return false;
  }

  isAttacking() {
    return this.mouse.leftClicked;
  }

  isAiming() {
    return this.mouse.rightDown;
  }
}

export const input = new InputManager();

