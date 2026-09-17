import * as THREE from 'three';
import { sound } from '../engine/Audio.js';
import { inventory } from './Inventory.js';

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.boss = null;

    this.spawnEnemies();
    this.spawnGanondorfReawakened();
  }

  spawnEnemies() {
    // Spawn Soldier Constructs on the Temple Island
    this.createConstruct(8, 73, 75);
    this.createConstruct(-12, 73, 85);

    // Spawn Bokoblin on lower sky islet
    this.createBokoblin(-55, 49, 30);
    this.createBokoblin(60, 54, 40);
  }

  createConstruct(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Materials
    const bodyMat = new THREE.MeshToonMaterial({
      color: 0x1f5945, // Zonai deep teal
      roughness: 0.5
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x33ffaa }); // Glowing cyan eye
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xffe279 }); // Energy blade

    // Torso (faceted Zonai stone)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.7), bodyMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    group.add(torso);

    // Head with single eye
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 4), bodyMat);
    head.position.y = 1.9;
    group.add(head);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), eyeMat);
    eye.position.set(0, 1.8, 0.3);
    group.add(eye);

    // Blade arm
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.2), bladeMat);
    blade.position.set(0.7, 0.8, 0.3);
    blade.rotation.x = Math.PI / 4;
    group.add(blade);

    this.scene.add(group);

    this.enemies.push({
      id: 'construct_' + Math.random(),
      name: "Soldier Construct I",
      group: group,
      position: group.position,
      health: 60,
      maxHealth: 60,
      attackPower: 15,
      attackCooldown: 0,
      patrolCenter: new THREE.Vector3(x, y, z),
      patrolAngle: Math.random() * Math.PI * 2,
      isDead: false
    });
  }

  createBokoblin(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const skinMat = new THREE.MeshToonMaterial({ color: 0xeb4d4b }); // Red
    const loinclothMat = new THREE.MeshToonMaterial({ color: 0x535c68 });

    // Round body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), skinMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // Horn on head
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 6), new THREE.MeshToonMaterial({ color: 0xf9ca24 }));
    horn.position.set(0, 1.7, 0);
    group.add(horn);

    // Club
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 1.2, 8), new THREE.MeshToonMaterial({ color: 0x6e4f32 }));
    club.position.set(0.6, 0.8, 0.3);
    group.add(club);

    this.scene.add(group);

    this.enemies.push({
      id: 'bokoblin_' + Math.random(),
      name: "Red Bokoblin",
      group: group,
      position: group.position,
      health: 45,
      maxHealth: 45,
      attackPower: 12,
      attackCooldown: 0,
      patrolCenter: new THREE.Vector3(x, y, z),
      patrolAngle: Math.random() * Math.PI * 2,
      isDead: false
    });
  }

  spawnGanondorfReawakened() {
    // Boss located on Far Arena Island (X=0, Y=22, Z=170)
    const group = new THREE.Group();
    group.position.set(0, 22.5, 170);

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0x3d4347 }); // Ash-grey skin
    const hairMat = new THREE.MeshToonMaterial({ color: 0xeb2f06 }); // Fiery crimson wild hair
    const robeMat = new THREE.MeshToonMaterial({ color: 0x1e1026 }); // Dark Gerudo king robes
    const goldMat = new THREE.MeshToonMaterial({ color: 0xffc048 });
    const gloomMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      wireframe: true
    }); // Gloom aura cage

    // Imposing tall figure (2.6m)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.8), robeMat);
    torso.position.y = 1.4;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.6), skinMat);
    head.position.y = 2.4;
    head.castShadow = true;
    group.add(head);

    // Fiery Red Hair Mane
    const mane = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 8), hairMat);
    mane.rotation.x = -Math.PI / 3;
    mane.position.set(0, 2.4, -0.6);
    group.add(mane);

    // Secret Stone / Forehead Gem
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
    gem.position.set(0, 2.6, 0.32);
    group.add(gem);

    // Gloom Katana Blade
    const katanaGeo = new THREE.BoxGeometry(0.08, 2.2, 0.15);
    const katanaMat = new THREE.MeshBasicMaterial({ color: 0x88001b });
    const katana = new THREE.Mesh(katanaGeo, katanaMat);
    katana.position.set(0.9, 1.4, 0.4);
    katana.rotation.x = Math.PI / 4;
    group.add(katana);

    // Swirling Gloom Aura Sphere around him
    this.gloomAura = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), gloomMat);
    this.gloomAura.position.y = 1.5;
    group.add(this.gloomAura);

    this.scene.add(group);

    this.boss = {
      id: 'ganondorf_reawakened',
      name: "Demon King Ganondorf - Reawakened Malice",
      group: group,
      position: group.position,
      health: 350,
      maxHealth: 350,
      attackPower: 30,
      phase: 1, // Phase 1: Swordsman, Phase 2: Gloom Demon King
      cooldown: 0,
      isDead: false
    };
  }

  update(delta, player) {
    // Animate Gloom Aura on Ganondorf
    if (this.gloomAura) {
      this.gloomAura.rotation.y += delta * 2;
      this.gloomAura.rotation.x += delta * 1.5;
    }

    // Update regular enemies
    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;

      const dist = enemy.position.distanceTo(player.position);

      if (dist < 18) {
        // Chase player
        const dir = player.position.clone().sub(enemy.position);
        dir.y = 0;
        dir.normalize();

        enemy.position.addScaledVector(dir, delta * 4.0);
        enemy.group.rotation.y = Math.atan2(dir.x, dir.z);

        // Attack if close
        if (dist < 2.2 && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.6;
          player.takeDamage(enemy.attackPower);
        }
      } else {
        // Gentle patrol
        enemy.patrolAngle += delta * 0.5;
        enemy.position.x = enemy.patrolCenter.x + Math.cos(enemy.patrolAngle) * 4;
        enemy.position.z = enemy.patrolCenter.z + Math.sin(enemy.patrolAngle) * 4;
      }

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= delta;
      }
    });

    // Update Ganondorf Boss AI
    if (this.boss && !this.boss.isDead) {
      const bossDist = this.boss.position.distanceTo(player.position);

      if (bossDist < 35) {
        // Face player
        const dir = player.position.clone().sub(this.boss.position);
        dir.y = 0;
        dir.normalize();
        this.boss.group.rotation.y = Math.atan2(dir.x, dir.z);

        // Phase 2 check (under 50% health)
        if (this.boss.health < this.boss.maxHealth * 0.5 && this.boss.phase === 1) {
          this.boss.phase = 2;
          this.boss.name = "Demon King Ganondorf - Fully Reawakened";
          this.gloomAura.scale.set(1.5, 1.5, 1.5);
          sound.playHitImpact();
        }

        // Boss move & attack
        const speed = this.boss.phase === 2 ? 6.5 : 4.0;
        if (bossDist > 3.0) {
          this.boss.position.addScaledVector(dir, delta * speed);
        } else {
          if (this.boss.cooldown <= 0) {
            this.boss.cooldown = this.boss.phase === 2 ? 1.4 : 2.2;
            player.takeDamage(this.boss.attackPower);
            sound.playSwordSlash();
          }
        }
      }

      if (this.boss.cooldown > 0) {
        this.boss.cooldown -= delta;
      }
    }

    // Check Link's sword attack against enemies
    if (player.state === 'attacking') {
      this.checkPlayerAttackHit(player);
    }

    // Check Link's arrows against enemies
    this.checkArrowHits(player);
  }

  checkPlayerAttackHit(player) {
    const attackRange = 2.8;
    const damage = inventory.getCurrentAttackPower();

    // Check standard enemies
    this.enemies.forEach(enemy => {
      if (!enemy.isDead && enemy.position.distanceTo(player.position) < attackRange) {
        enemy.health -= damage;
        sound.playHitImpact();

        // Knockback
        const pushDir = enemy.position.clone().sub(player.position).normalize();
        enemy.position.addScaledVector(pushDir, 1.2);

        if (enemy.health <= 0) {
          enemy.isDead = true;
          this.scene.remove(enemy.group);
          sound.playItemPickup();
        }
      }
    });

    // Check Boss
    if (this.boss && !this.boss.isDead && this.boss.position.distanceTo(player.position) < attackRange + 1.0) {
      this.boss.health -= damage;
      sound.playHitImpact();

      if (this.boss.health <= 0) {
        this.boss.isDead = true;
        this.scene.remove(this.boss.group);
        sound.playSplashJingle();
      }
    }
  }

  checkArrowHits(player) {
    for (let i = player.arrows.length - 1; i >= 0; i--) {
      const arr = player.arrows[i];
      let hit = false;

      // Check against enemies
      for (const enemy of this.enemies) {
        if (!enemy.isDead && arr.mesh.position.distanceTo(enemy.position) < 1.8) {
          enemy.health -= arr.damage;
          sound.playHitImpact();
          hit = true;
          if (enemy.health <= 0) {
            enemy.isDead = true;
            this.scene.remove(enemy.group);
            sound.playItemPickup();
          }
          break;
        }
      }

      // Check against Boss
      if (!hit && this.boss && !this.boss.isDead && arr.mesh.position.distanceTo(this.boss.position) < 2.5) {
        this.boss.health -= arr.damage;
        sound.playHitImpact();
        hit = true;
        if (this.boss.health <= 0) {
          this.boss.isDead = true;
          this.scene.remove(this.boss.group);
          sound.playSplashJingle();
        }
      }

      if (hit) {
        this.scene.remove(arr.mesh);
        player.arrows.splice(i, 1);
      }
    }
  }

  getActiveBoss() {
    if (this.boss && !this.boss.isDead) {
      return this.boss;
    }
    return null;
  }
}

