import * as THREE from 'three';

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Create 3-tone Cel-Shading Ramp Texture for Zelda TotK toon rendering
    this.createToonRampTexture();

    // Create WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7ac1eb); // Hyrule Sky blue
    this.scene.fog = new THREE.FogExp2(0xbbe4ff, 0.0016);

    // Setup Lighting
    this.setupLighting();

    // Setup Sky & Clouds
    this.setupSkyDome();

    // Zonai glowing particles
    this.setupZonaiParticles();

    window.addEventListener('resize', () => this.onResize());
  }

  createToonRampTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    // 3 discrete bands of shading: dark shadow, midtone, bright highlight
    ctx.fillStyle = '#666666';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#999999';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(2, 0, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 0, 1, 1);

    this.toonRamp = new THREE.CanvasTexture(canvas);
    this.toonRamp.minFilter = THREE.NearestFilter;
    this.toonRamp.magFilter = THREE.NearestFilter;
  }

  setupLighting() {
    // Warm Hyrule Sky fill
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.75);
    this.scene.add(ambientLight);

    // Golden Directional Sunlight with sharp soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfffae6, 1.55);
    this.sunLight.position.set(140, 260, 90);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 600;
    this.sunLight.shadow.camera.left = -160;
    this.sunLight.shadow.camera.right = 160;
    this.sunLight.shadow.camera.top = 160;
    this.sunLight.shadow.camera.bottom = -160;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Hemisphere light (sky cyan to ground golden-green)
    const hemiLight = new THREE.HemisphereLight(0x7ed6df, 0xc4e538, 0.55);
    this.scene.add(hemiLight);
  }

  setupSkyDome() {
    const skyGeo = new THREE.SphereGeometry(850, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1e88e5) },
        bottomColor: { value: new THREE.Color(0xfff8e7) },
        offset: { value: 35 },
        exponent: { value: 0.55 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // Fluffy TotK cloud formations
    this.cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(15, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });

    for (let i = 0; i < 48; i++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 90 + Math.random() * 480;
      const height = -15 + (Math.random() * 80 - 40);
      puff.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      puff.scale.set(1.6 + Math.random() * 2.2, 0.7 + Math.random() * 0.9, 1.6 + Math.random() * 2.2);
      this.cloudGroup.add(puff);
    }
    this.scene.add(this.cloudGroup);
  }

  setupZonaiParticles() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(0x2ed573); // Zonai emerald
    const color2 = new THREE.Color(0xffd32a); // Golden sacred energy

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = Math.random() * 90;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;

      const chosenColor = Math.random() > 0.4 ? color1 : color2;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta) {
    if (this.cloudGroup) {
      this.cloudGroup.rotation.y += delta * 0.012;
    }

    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 2.8;
        if (positions[i] > 90) positions[i] = 0;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}
