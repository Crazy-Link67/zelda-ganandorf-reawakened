import * as THREE from 'three';

export class SkyIslands {
  constructor(scene, abilities) {
    this.scene = scene;
    this.abilities = abilities;
    this.group = new THREE.Group();
    this.colliders = []; // cylindrical / box colliders for terrain physics

    this.buildGreatSkyIsland();
    this.scene.add(this.group);
  }

  buildGreatSkyIsland() {
    // Materials
    const stoneMat = new THREE.MeshToonMaterial({
      color: 0x8a958e,
      roughness: 0.8
    });
    const grassMat = new THREE.MeshToonMaterial({
      color: 0x76b852, // Vibrant Zelda green grass
      roughness: 0.9
    });
    const woodMat = new THREE.MeshToonMaterial({
      color: 0x6e4f32
    });
    const goldLeafMat = new THREE.MeshToonMaterial({
      color: 0xf5cd34, // Golden yellow Zonai trees
      flatShading: true
    });
    const zonaiMat = new THREE.MeshToonMaterial({
      color: 0x247158, // Zonai deep teal
      emissive: 0x1dd1a1,
      emissiveIntensity: 0.15
    });

    // 1. Awakening Island (Spawn Platform high up at Y=115)
    this.createIsland({
      x: 0, y: 115, z: 0,
      radius: 18,
      height: 8,
      grassMat, stoneMat
    });

    // Diving Board extending over the sky!
    const boardGeo = new THREE.BoxGeometry(4, 0.6, 16);
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.position.set(0, 119.5, 14);
    board.receiveShadow = true;
    board.castShadow = true;
    this.group.add(board);
    this.colliders.push({ position: new THREE.Vector3(0, 115, 14), radius: 8, height: 4.8 });

    // Awakening archway
    this.createZonaiArch(0, 119, -8, zonaiMat);

    // 2. Temple of Time Main Sky Island (Y=65, z=70)
    this.createIsland({
      x: 0, y: 65, z: 80,
      radius: 45,
      height: 14,
      grassMat, stoneMat
    });

    // Temple Pillars
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      this.createPillar(i * 9, 72, 70, stoneMat);
      this.createPillar(i * 9, 72, 90, stoneMat);
    }

    // Zonai Shrine in center of Temple Island
    this.createZonaiShrine(0, 72, 80, zonaiMat);

    // Golden Zonai Trees
    this.createZonaiTree(-15, 72, 65, woodMat, goldLeafMat);
    this.createZonaiTree(18, 72, 75, woodMat, goldLeafMat);
    this.createZonaiTree(-20, 72, 95, woodMat, goldLeafMat);
    this.createZonaiTree(14, 72, 98, woodMat, goldLeafMat);

    // 3. Lower Sky Archipelago & Floating Stepping Stones
    const islandLocations = [
      { x: -55, y: 40, z: 30, r: 16, h: 8 },
      { x: 60, y: 45, z: 40, r: 20, h: 9 },
      { x: -70, y: 20, z: 120, r: 25, h: 10 },
      { x: 45, y: 25, z: 130, r: 22, h: 9 },
      { x: 0, y: 10, z: 170, r: 35, h: 12 } // Ganondorf Boss Arena Island!
    ];

    islandLocations.forEach(loc => {
      this.createIsland({
        x: loc.x, y: loc.y, z: loc.z,
        radius: loc.r,
        height: loc.h,
        grassMat, stoneMat
      });
    });

    // 4. Ultrahand Grabbable Objects (Zonai boxes, planks, chests)
    this.spawnUltrahandObjects();
  }

  createIsland({ x, y, z, radius, height, grassMat, stoneMat }) {
    const islandGroup = new THREE.Group();
    islandGroup.position.set(x, y, z);

    // Grass Top Cylinder
    const topGeo = new THREE.CylinderGeometry(radius, radius * 0.95, 1.2, 24);
    const topMesh = new THREE.Mesh(topGeo, grassMat);
    topMesh.position.y = height;
    topMesh.receiveShadow = true;
    islandGroup.add(topMesh);

    // Island Underside Inverted Cone (craggy floating rock)
    const baseGeo = new THREE.ConeGeometry(radius * 0.95, height * 1.6, 16);
    baseGeo.rotateX(Math.PI);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
    baseMesh.position.y = height * 0.2;
    baseMesh.receiveShadow = true;
    islandGroup.add(baseMesh);

    this.group.add(islandGroup);

    // Register collider
    this.colliders.push({
      position: new THREE.Vector3(x, y, z),
      radius: radius,
      height: height + 0.6
    });
  }

  createPillar(x, y, z, mat) {
    const pillarGeo = new THREE.CylinderGeometry(1.0, 1.2, 10, 12);
    const pillar = new THREE.Mesh(pillarGeo, mat);
    pillar.position.set(x, y + 5, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    this.group.add(pillar);
  }

  createZonaiArch(x, y, z, mat) {
    const archGroup = new THREE.Group();
    archGroup.position.set(x, y, z);

    const pillar1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.2), mat);
    pillar1.position.set(-3, 3, 0);
    const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 1.2), mat);
    pillar2.position.set(3, 3, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 1.5), mat);
    beam.position.set(0, 6, 0);

    archGroup.add(pillar1);
    archGroup.add(pillar2);
    archGroup.add(beam);
    this.group.add(archGroup);
  }

  createZonaiShrine(x, y, z, mat) {
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(x, y, z);

    // Swirling green stone monolith
    const shrineGeo = new THREE.ConeGeometry(2.5, 7, 8);
    const shrine = new THREE.Mesh(shrineGeo, mat);
    shrine.position.y = 3.5;
    shrine.castShadow = true;
    shrineGroup.add(shrine);

    // Glowing green spiral aura ring
    const ringGeo = new THREE.TorusGeometry(3.5, 0.15, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x33ffaa,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.0;
    shrineGroup.add(ring);

    this.group.add(shrineGroup);
  }

  createZonaiTree(x, y, z, trunkMat, leafMat) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 6, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Golden Leaves (layered dodecahedrons)
    const leaves1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 1), leafMat);
    leaves1.position.y = 6.5;
    leaves1.castShadow = true;
    treeGroup.add(leaves1);

    const leaves2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), leafMat);
    leaves2.position.set(1.2, 8.2, 0);
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
      new THREE.Vector3(6, 120.5, 2),
      new THREE.Vector3(-5, 120.5, 4),
      new THREE.Vector3(8, 73, 68),
      new THREE.Vector3(-10, 73, 72)
    ];

    positions.forEach((pos) => {
      const boxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
      const box = new THREE.Mesh(boxGeo, boxMat);
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

