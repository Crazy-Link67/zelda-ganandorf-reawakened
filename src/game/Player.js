import * as THREE from 'three';
import { sound } from '../engine/Audio.js';
import { inventory } from './Inventory.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // State
    this.position = new THREE.Vector3(0, 120, 0); // Spawn high on Great Sky Island
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.state = 'falling'; // 'grounded' | 'falling' | 'diving' | 'gliding' | 'climbing' | 'attacking' | 'aiming'
    this.isGrounded = false;

    // Attributes
    this.maxHealth = 100;
    this.health = 100; // 5 Hearts (20 hp each)
    this.maxStamina = 100;
    this.stamina = 100;
    this.staminaExhausted = false;

    // Movement speeds
    this.walkSpeed = 6.0;
    this.runSpeed = 12.0;
    this.glideSpeed = 10.0;
    this.diveSpeed = 35.0;
    this.climbSpeed = 3.5;
    this.jumpForce = 9.5;

    // Combat
    this.attackTimer = 0;
    this.comboStep = 0;

    // Active projectiles (arrows)
    this.arrows = [];

    // Build 3D Mesh
    this.mesh = new THREE.Group();
    this.buildCharacterMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    // Wind trail particles for skydiving
    this.setupWindTrails();
  }

  buildCharacterMesh() {
    // Cel-shaded styled character for Link
    const skinMat = new THREE.MeshToonMaterial({ color: 0xffdfc4 });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xf5cf47 }); // Golden blond
    const tunicMat = new THREE.MeshToonMaterial({ color: 0x22a6b3 }); // Champion's Tunic cyan-teal
    const pantsMat = new THREE.MeshToonMaterial({ color: 0xede6d6 }); // Off-white trousers
    const bootsMat = new THREE.MeshToonMaterial({ color: 0x5b381e }); // Leather brown
    const zonaiArmMat = new THREE.MeshToonMaterial({
      color: 0x2ed573,
      emissive: 0x1dd1a1,
      emissiveIntensity: 0.6
    }); // Glowing green Zonai prosthetic arm

    // Torso / Tunic
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, tunicMat);
    this.torso.position.y = 1.0;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.65;
    this.head.castShadow = true;
    this.mesh.add(this.head);

    // Hair
    const hairGeo = new THREE.ConeGeometry(0.36, 0.4, 8);
    hairGeo.rotateX(Math.PI);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.78, -0.05);
    this.mesh.add(hair);

    // Left Arm (Normal)
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.7, 8);
    this.leftArm = new THREE.Mesh(armGeo, skinMat);
    this.leftArm.position.set(-0.48, 1.0, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    // Right Arm (Zonai Glowing Arm!)
    this.rightArm = new THREE.Mesh(armGeo, zonaiArmMat);
    this.rightArm.position.set(0.48, 1.0, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8);
    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.2, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.2, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // Master Sword & Sheath
    this.setupWeapons();

    // Paraglider Mesh
    this.setupParaglider();
  }

  setupWeapons() {
    this.weaponGroup = new THREE.Group();

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.08, 1.1, 0.03);
    const bladeMat = new THREE.MeshToonMaterial({
      color: 0xdff9fb,
      emissive: 0x7ed6df,
      emissiveIntensity: 0.3
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.55;
    this.weaponGroup.add(blade);

    // Guard (Triforce purple/gold)
    const guardGeo = new THREE.BoxGeometry(0.35, 0.07, 0.08);
    const guardMat = new THREE.MeshToonMaterial({ color: 0x4834d4 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    this.weaponGroup.add(guard);

    // Hilt
    const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8);
    const hiltMat = new THREE.MeshToonMaterial({ color: 0x22a6b3 });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = -0.15;
    this.weaponGroup.add(hilt);

    // Position on right hand
    this.weaponGroup.position.set(0.48, 0.65, 0.2);
    this.weaponGroup.rotation.x = Math.PI / 2;
    this.mesh.add(this.weaponGroup);

    // Hylian Shield on Left Arm
    const shieldGeo = new THREE.BoxGeometry(0.55, 0.7, 0.06);
    const shieldMat = new THREE.MeshToonMaterial({ color: 0x130f40 });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(-0.5, 1.0, 0.15);
    this.shieldMesh.rotation.y = Math.PI / 2;
    this.shieldMesh.castShadow = true;
    this.mesh.add(this.shieldMesh);
  }

  setupParaglider() {
    this.paraglider = new THREE.Group();

    // Sail cloth
    const sailGeo = new THREE.BoxGeometry(2.4, 0.02, 1.1);
    const sailMat = new THREE.MeshToonMaterial({ color: 0x795548, side: THREE.DoubleSide });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.y = 0.8;
    this.paraglider.add(sail);

    // Framework struts
    const strutMat = new THREE.MeshToonMaterial({ color: 0xdfe4ea });
    const leftStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), strutMat);
    leftStrut.position.set(-0.6, 0.4, 0);
    this.paraglider.add(leftStrut);

    const rightStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), strutMat);
    rightStrut.position.set(0.6, 0.4, 0);
    this.paraglider.add(rightStrut);

    this.paraglider.position.set(0, 1.4, 0);
    this.paraglider.visible = false;
    this.mesh.add(this.paraglider);
  }

  setupWindTrails() {
    const count = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 6); // lines
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });

    this.windTrails = new THREE.LineSegments(geometry, material);
    this.windTrails.visible = false;
    this.scene.add(this.windTrails);
  }

  update(delta, input, cameraForward, cameraRight, islands) {
    this.updateStamina(delta);
    this.updateMovement(delta, input, cameraForward, cameraRight, islands);
    this.updateCombat(delta, input);
    this.updateAnimations(delta);
    this.updateProjectiles(delta, islands);
  }

  updateStamina(delta) {
    if (this.isGrounded && this.state !== 'sprinting') {
      this.stamina = Math.min(this.maxStamina, this.stamina + 25 * delta);
      if (this.stamina > 25) this.staminaExhausted = false;
    }
  }

  updateMovement(delta, input, cameraForward, cameraRight, islands) {
    const moveInput = input.getMoveVector();
    const isMoving = Math.abs(moveInput.forward) > 0.1 || Math.abs(moveInput.right) > 0.1;
    const wantsSprint = input.isSprinting() && !this.staminaExhausted && this.stamina > 5;

    // Check jump / paraglider input
    if (input.jumpPressed) {
      if (this.isGrounded) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
        this.state = 'falling';
      } else if (this.state === 'falling' || this.state === 'diving') {
        // Deploy paraglider!
        if (this.stamina > 10) {
          this.state = 'gliding';
          this.paraglider.visible = true;
          sound.playGliderDeploy();
        }
      } else if (this.state === 'gliding') {
        // Put away glider, enter skydiving freefall
        this.state = 'diving';
        this.paraglider.visible = false;
      }
    }

    // Gravity & Fall physics
    if (!this.isGrounded) {
      if (this.state === 'gliding') {
        // Controlled slow descent
        this.velocity.y = -2.5;
        this.stamina = Math.max(0, this.stamina - 7.5 * delta);
        if (this.stamina <= 0) {
          this.staminaExhausted = true;
          this.state = 'falling';
          this.paraglider.visible = false;
        }
      } else if (this.state === 'diving') {
        // Fast aerodynamic freefall through the clouds
        this.velocity.y = Math.max(-this.diveSpeed, this.velocity.y - 45 * delta);
        sound.setWindIntensity(0.9);
        this.windTrails.visible = true;
        this.updateWindParticles();
      } else {
        // Standard fall
        this.velocity.y -= 25 * delta;
        sound.setWindIntensity(Math.min(1.0, Math.abs(this.velocity.y) / 30));
        this.windTrails.visible = Math.abs(this.velocity.y) > 20;
      }
    } else {
      sound.setWindIntensity(0);
      this.windTrails.visible = false;
      this.paraglider.visible = false;
    }

    // Horizontal Movement
    let speed = this.walkSpeed;
    if (this.state === 'gliding') {
      speed = this.glideSpeed;
    } else if (wantsSprint && this.isGrounded && isMoving) {
      speed = this.runSpeed;
      this.stamina = Math.max(0, this.stamina - 15 * delta);
      if (this.stamina <= 0) this.staminaExhausted = true;
    }

    const moveDir = new THREE.Vector3();
    if (isMoving) {
      moveDir.addScaledVector(cameraForward, moveInput.forward);
      moveDir.addScaledVector(cameraRight, moveInput.right);
      moveDir.y = 0;
      moveDir.normalize();

      // Rotate player towards movement
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.mesh.rotation.y = targetAngle;
      this.rotation = targetAngle;

      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
    }

    // Apply Velocity
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Check Island Collisions / Grounding
    this.checkTerrainCollision(islands);

    // If fallen way below Hyrule (void safe reset to Awakening Island)
    if (this.position.y < -150) {
      this.respawn();
    }

    this.mesh.position.copy(this.position);
  }

  checkTerrainCollision(islands) {
    if (!islands || !islands.colliders) return;

    let highestGround = -9999;
    const playerRadius = 0.5;

    for (const collider of islands.colliders) {
      const dx = this.position.x - collider.position.x;
      const dz = this.position.z - collider.position.z;
      const dist2D = Math.sqrt(dx * dx + dz * dz);

      if (dist2D < collider.radius + playerRadius) {
        const groundHeight = collider.position.y + collider.height;
        // Check if player is right above or standing on it
        if (this.position.y >= groundHeight - 1.2 && this.position.y <= groundHeight + 2.0) {
          if (groundHeight > highestGround) {
            highestGround = groundHeight;
          }
        }
      }
    }

    if (highestGround > -9000 && this.velocity.y <= 0) {
      this.position.y = highestGround;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.state === 'diving' || this.state === 'falling' || this.state === 'gliding') {
        this.state = 'grounded';
        this.paraglider.visible = false;
        sound.playHitImpact();
      }
    } else {
      this.isGrounded = false;
      if (this.state === 'grounded') {
        this.state = 'falling';
      }
    }
  }

  updateWindParticles() {
    if (!this.windTrails) return;
    const pos = this.windTrails.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 6) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.0 + Math.random() * 2.0;
      const yOffset = Math.random() * 6.0;

      pos[i] = this.position.x + Math.cos(angle) * r;
      pos[i + 1] = this.position.y + yOffset;
      pos[i + 2] = this.position.z + Math.sin(angle) * r;

      pos[i + 3] = pos[i];
      pos[i + 4] = pos[i + 1] + 2.5; // Upward streak
      pos[i + 5] = pos[i + 2];
    }
    this.windTrails.geometry.attributes.position.needsUpdate = true;
  }

  updateCombat(delta, input) {
    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.state = this.isGrounded ? 'grounded' : 'falling';
      }
    }

    if (input.isAttacking() && this.attackTimer <= 0 && this.state !== 'gliding') {
      this.attackTimer = 0.35;
      this.state = 'attacking';
      sound.playSwordSlash();
      // Animate sword slash swing
      this.weaponGroup.rotation.z = Math.PI * 0.8;
    }

    // Bow Aiming & Shooting
    if (input.isAiming() && this.state !== 'gliding') {
      this.state = 'aiming';
      if (input.mouse.leftClicked && inventory.arrows > 0) {
        this.shootArrow();
      }
    } else if (this.state === 'aiming') {
      this.state = this.isGrounded ? 'grounded' : 'falling';
    }
  }

  shootArrow() {
    inventory.arrows--;
    sound.playSwordSlash();

    // Create Arrow
    const arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x33ffaa }); // Zonai energy arrow
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.copy(this.position).add(new THREE.Vector3(0, 1.5, 0));

    // Shoot in direction Link is facing
    const dir = new THREE.Vector3(
      Math.sin(this.rotation),
      0.1,
      Math.cos(this.rotation)
    ).normalize();

    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(arrow);

    this.arrows.push({
      mesh: arrow,
      velocity: dir.multiplyScalar(45),
      life: 3.0,
      damage: 35
    });
  }

  updateProjectiles(delta, islands) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arr = this.arrows[i];
      arr.life -= delta;
      arr.mesh.position.addScaledVector(arr.velocity, delta);
      arr.velocity.y -= 9.8 * delta; // Bullet drop

      if (arr.life <= 0 || arr.mesh.position.y < -50) {
        this.scene.remove(arr.mesh);
        this.arrows.splice(i, 1);
      }
    }
  }

  updateAnimations(delta) {
    const time = Date.now() * 0.008;

    if (this.state === 'attacking') {
      this.weaponGroup.rotation.x = Math.PI / 2 + Math.sin(time * 3) * 1.5;
    } else {
      this.weaponGroup.rotation.x = Math.PI / 2;
    }

    if (this.isGrounded) {
      const isMoving = Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.z) > 0.5;
      if (isMoving) {
        this.leftLeg.rotation.x = Math.sin(time) * 0.7;
        this.rightLeg.rotation.x = -Math.sin(time) * 0.7;
        this.leftArm.rotation.x = -Math.sin(time) * 0.6;
        this.rightArm.rotation.x = Math.sin(time) * 0.6;
      } else {
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
      }
    } else if (this.state === 'diving') {
      // Skydiving pose: arms out, legs spread, face down
      this.mesh.rotation.x = Math.PI / 2.3;
      this.leftArm.rotation.z = -1.2;
      this.rightArm.rotation.z = 1.2;
      this.leftLeg.rotation.z = -0.4;
      this.rightLeg.rotation.z = 0.4;
    } else if (this.state === 'gliding') {
      this.mesh.rotation.x = 0;
      this.leftArm.rotation.x = -Math.PI * 0.8;
      this.rightArm.rotation.x = -Math.PI * 0.8;
      this.leftLeg.rotation.z = 0;
      this.rightLeg.rotation.z = 0;
    } else {
      this.mesh.rotation.x = 0;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    sound.playHitImpact();
    if (this.health <= 0) {
      this.respawn();
    }
  }

  respawn() {
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;
    this.position.set(0, 120, 0); // Back to Great Sky Island
    this.velocity.set(0, 0, 0);
    this.state = 'falling';
  }

  getHandPosition() {
    const hand = this.rightArm.position.clone();
    hand.applyMatrix4(this.mesh.matrixWorld);
    return hand;
  }
}

