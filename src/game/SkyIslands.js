import * as THREE from 'three';

export class SkyIslands {
  constructor(scene, abilities) {
    this.scene = scene;
    this.abilities = abilities;
    this.group = new THREE.Group();
    this.colliders = []; // cylindrical / box colliders for terrain physics

    this.createProceduralTextures();
    this.buildGreatSkyIsland();
    this.scene.add(this.group);
  }

  createProceduralTextures() {
    // 1. Ancient Stone Paver Texture
    const canvasStone = document.createElement('canvas');
    canvasStone.width = 256;
    canvasStone.height = 256;
    const ctxStone = canvasStone.getContext('2d');
    ctxStone.fillStyle = '#7d8a83';
    ctxStone.fillRect(0, 0, 256, 256);
    // Paver tiles
    ctxStone.strokeStyle = '#5a6660';
    ctxStone.lineWidth = 4;
    for (let x = 0; x < 256; x += 64) {
      for (let y = 0; y < 256; y += 64) {
        ctxStone.strokeRect(x, y, 64, 64);
      }
    }
    // Moss speckles
    ctxStone.fillStyle = '#5c8a4d';
    for (let i = 0; i < 400; i++) {
      ctxStone.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }
    this.stoneTexture = new THREE.CanvasTexture(canvasStone);
    this.stoneTexture.wrapS = THREE.RepeatWrapping;
    this.stoneTexture.wrapT = THREE.RepeatWrapping;
    this.stoneTexture.repeat.set(4, 4);

    // 2. Zelda Grass Texture
    const canvasGrass = document.createElement('canvas');
    canvasGrass.width = 256;
    canvasGrass.height = 256;
    const ctxGrass = canvasGrass.getContext('2d');
    ctxGrass.fillStyle = '#65a73e'; // TotK vibrant green
    ctxGrass.fillRect(0, 0, 256, 256);
    ctxGrass.fillStyle = '#7cbd48';
    for (let i = 0; i < 600; i++) {
      ctxGrass.fillRect(Math.random() * 256, Math.random() * 256, 2, 6);
    }
    this.grassTexture = new THREE.CanvasTexture(canvasGrass);
    this.grassTexture.wrapS = THREE.RepeatWrapping;
    this.grassTexture.wrapT = THREE.RepeatWrapping;
    this.grassTexture.repeat.set(6, 6);
  }

  buildGreatSkyIsland() {
    // Cel-shaded styled materials
    const stoneMat = new THREE.MeshToonMaterial({
      map: this.stoneTexture,
      roughness: 0.8
    });
    const grassMat = new THREE.MeshToonMaterial({
      map: this.grassTexture,
      roughness: 0.9
    });
    const woodMat = new THREE.MeshToonMaterial({
      color: 0x5b381e
    });
    const goldLeafMat = new THREE.MeshToonMaterial({
      color: 0xf6cf3c,
      flatShading: true
    });
    const zonaiMat = new THREE.MeshToonMaterial({
      color: 0x1f5e4c,
      emissive: 0x1dd1a1,
      emissiveIntensity: 0.25
    });

    // ==========================================
    // 1. THE ROOM OF AWAKENING & SANCTUARY (Spawn at 0, 124.5, 0)
    // ==========================================
    const sanctuaryGroup = new THREE.Group();
    sanctuaryGroup.position.set(0, 115, 0);

    // Solid Main Foundation Cylinder (Top surface at Y=124.5)
    const foundationGeo = new THREE.CylinderGeometry(24, 21, 9.5, 32);
    const foundationMesh = new THREE.Mesh(foundationGeo, stoneMat);
    foundationMesh.position.y = 4.75;
    foundationMesh.receiveShadow = true;
    sanctuaryGroup.add(foundationMesh);

    // Sacred Altar Dais where Link awakens (Y=124.5)
    const daisGeo = new THREE.CylinderGeometry(4.5, 5.0, 0.4, 24);
    const daisMesh = new THREE.Mesh(daisGeo, zonaiMat);
    daisMesh.position.y = 9.7;
    daisMesh.receiveShadow = true;
    sanctuaryGroup.add(daisMesh);

    // Sanctuary Curved Wall & Archway Pillars
    const wallMat = new THREE.MeshToonMaterial({ color: 0x6e7b74 });
    for (let angle = 0.4; angle < Math.PI * 1.8; angle += 0.55) {
      const px = Math.cos(angle) * 14;
      const pz = Math.sin(angle) * 14;
      const col = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.0, 2.0), wallMat);
      col.position.set(px, 12.5, pz);
      col.castShadow = true;
      sanctuaryGroup.add(col);
    }

    // Sacred Zonai Awakening Pillars
    this.createZonaiArch(0, 124.5, -7, zonaiMat);

    // Inverted Craggy Rock Base beneath Awakening Island
    const rockBase = new THREE.Mesh(
      new THREE.ConeGeometry(21, 28, 16),
      stoneMat
    );
    rockBase.rotation.x = Math.PI;
    rockBase.position.y = -8;
    rockBase.receiveShadow = true;
    sanctuaryGroup.add(rockBase);

    // Long Iconic Diving Board extending out into open sky
    const boardGeo = new THREE.BoxGeometry(5.5, 0.8, 22);
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.position.set(0, 124.4, 18);
    board.receiveShadow = true;
    board.castShadow = true;
    this.group.add(board);

    // Register Awakening Sanctuary Collider: Ground is solid at Y=124.5!
    this.colliders.push({
      position: new THREE.Vector3(0, 115, 0),
      radius: 24,
      height: 9.5 // surface at 124.5
    });

    // Diving board collider
    this.colliders.push({
      position: new THREE.Vector3(0, 124.0, 18),
      radius: 9,
      height: 0.8
    });

    this.group.add(sanctuaryGroup);

    // ==========================================
    // 2. TEMPLE OF TIME MAIN SKY ISLAND (Y=65, Z=85)
    // ==========================================
    this.createIsland({
      x: 0, y: 65, z: 85,
      radius: 46,
      height: 14,
      grassMat, stoneMat
    });

    // Temple Pillars
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      this.createPillar(i * 10, 72, 75, stoneMat);
      this.createPillar(i * 10, 72, 95, stoneMat);
    }

    // Zonai Shrine in center of Temple Island
    this.createZonaiShrine(0, 72, 85, zonaiMat);

    // Golden Autumn Trees
    this.createZonaiTree(-16, 72, 70, woodMat, goldLeafMat);
    this.createZonaiTree(18, 72, 78, woodMat, goldLeafMat);
    this.createZonaiTree(-22, 72, 100, woodMat, goldLeafMat);
    this.createZonaiTree(15, 72, 102, woodMat, goldLeafMat);

    // ==========================================
    // 3. SURROUNDING SKY ARCHIPELAGO & BRIDGES
    // ==========================================
    const islandLocations = [
      { x: -60, y: 40, z: 35, r: 18, h: 8 },
      { x: 65, y: 45, z: 45, r: 22, h: 9 },
      { x: -75, y: 25, z: 125, r: 26, h: 10 },
      { x: 50, y: 30, z: 135, r: 24, h: 9 },
      { x: 0, y: 15, z: 175, r: 38, h: 12 } // Ganondorf Boss Arena!
    ];

    islandLocations.forEach(loc => {
      this.createIsland({
        x: loc.x, y: loc.y, z: loc.z,
        radius: loc.r,
        height: loc.h,
        grassMat, stoneMat
      });
    });

    // 4. Ultrahand Grabbable Physics Blocks & Planks
    this.spawnUltrahandObjects();
  }

  createIsland({ x, y, z, radius, height, grassMat, stoneMat }) {
    const islandGroup = new THREE.Group();
    islandGroup.position.set(x, y, z);

    // Grass Top
    const topGeo = new THREE.CylinderGeometry(radius, radius * 0.95, 1.4, 24);
    const topMesh = new THREE.Mesh(topGeo, grassMat);
    topMesh.position.y = height;
    topMesh.receiveShadow = true;
    islandGroup.add(topMesh);

    // Underside Craggy Rock Cone
    const baseGeo = new THREE.ConeGeometry(radius * 0.95, height * 1.7, 16);
    baseGeo.rotateX(Math.PI);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
    baseMesh.position.y = height * 0.15;
    baseMesh.receiveShadow = true;
    islandGroup.add(baseMesh);

    this.group.add(islandGroup);

    // Register terrain collider
    this.colliders.push({
      position: new THREE.Vector3(x, y, z),
      radius: radius,
      height: height + 0.7
    });
  }

  createPillar(x, y, z, mat) {
    const pillarGeo = new THREE.CylinderGeometry(1.1, 1.3, 11, 12);
    const pillar = new THREE.Mesh(pillarGeo, mat);
    pillar.position.set(x, y + 5.5, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    this.group.add(pillar);
  }

  createZonaiArch(x, y, z, mat) {
    const archGroup = new THREE.Group();
    archGroup.position.set(x, y, z);

    const pillar1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.5, 1.4), mat);
    pillar1.position.set(-3.2, 3.25, 0);
    const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.5, 1.4), mat);
    pillar2.position.set(3.2, 3.25, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 1.6), mat);
    beam.position.set(0, 6.5, 0);

    archGroup.add(pillar1);
    archGroup.add(pillar2);
    archGroup.add(beam);
    this.group.add(archGroup);
  }

  createZonaiShrine(x, y, z, mat) {
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(x, y, z);

    // Swirling stone obelisk
    const shrineGeo = new THREE.ConeGeometry(2.8, 8, 8);
    const shrine = new THREE.Mesh(shrineGeo, mat);
    shrine.position.y = 4.0;
    shrine.castShadow = true;
    shrineGroup.add(shrine);

    // Glowing green spiral aura
    const ringGeo = new THREE.TorusGeometry(3.8, 0.2, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ed573,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.4;
    shrineGroup.add(ring);

    this.group.add(shrineGroup);
  }

  createZonaiTree(x, y, z, trunkMat, leafMat) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 6.5, 8), trunkMat);
    trunk.position.y = 3.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const leaves1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5, 1), leafMat);
    leaves1.position.y = 7.0;
    leaves1.castShadow = true;
    treeGroup.add(leaves1);

    const leaves2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), leafMat);
    leaves2.position.set(1.4, 8.8, 0);
    leaves2.castShadow = true;
    treeGroup.add(leaves2);

    this.group.add(treeGroup);
  }

  spawnUltrahandObjects() {
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xd3a369,
      roughness: 0.6,
      metalness: 0.1
    });

    const positions = [
      new THREE.Vector3(7, 125.5, 3),
      new THREE.Vector3(-6, 125.5, 5),
      new THREE.Vector3(9, 73, 72),
      new THREE.Vector3(-11, 73, 76)
    ];

    positions.forEach((pos) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), boxMat);
      box.position.copy(pos);
      box.castShadow = true;
      box.receiveShadow = true;
      box.userData.isGrabbable = true;

      this.group.add(box);
      if (this.abilities) {
        this.abilities.registerInteractable(box);
      }
    });
  }
}
