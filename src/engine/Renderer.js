import * as THREE from 'three';

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

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
    this.renderer.toneMappingExposure = 1.15;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8cd3ff); // High sky Hyrule blue
    this.scene.fog = new THREE.FogExp2(0xb5e2ff, 0.0018);

    // Setup Lighting
    this.setupLighting();

    // Setup Sky & Clouds
    this.setupSkyDome();

    // Particle Group for Zonai floating embers
    this.particles = null;
    this.setupZonaiParticles();

    // Resize handling
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Ambient light - warm sky fill
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.65);
    this.scene.add(ambientLight);

    // Main Directional Sunlight with shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sunLight.position.set(120, 250, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 600;
    this.sunLight.shadow.camera.left = -150;
    this.sunLight.shadow.camera.right = 150;
    this.sunLight.shadow.camera.top = 150;
    this.sunLight.shadow.camera.bottom = -150;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Hemisphere light (sky blue to ground golden-green)
    const hemiLight = new THREE.HemisphereLight(0x7ac1eb, 0xb8cf7e, 0.5);
    this.scene.add(hemiLight);
  }

  setupSkyDome() {
    // Large hemisphere sky dome with gradient
    const skyGeo = new THREE.SphereGeometry(800, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x2887e3) },
        bottomColor: { value: new THREE.Color(0xfff6dc) },
        offset: { value: 30 },
        exponent: { value: 0.6 }
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

    // Floating low-poly fluffy TotK clouds
    this.cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(14, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      flatShading: true
    });

    for (let i = 0; i < 40; i++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 450;
      const height = -20 + (Math.random() * 70 - 35);
      puff.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      puff.scale.set(1.5 + Math.random() * 2, 0.6 + Math.random() * 0.8, 1.5 + Math.random() * 2);
      this.cloudGroup.add(puff);
    }
    this.scene.add(this.cloudGroup);
  }

  setupZonaiParticles() {
    // Floating glowing green & gold embers reminiscent of Zonai magic
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(0x35ffaa); // Zonai green
    const color2 = new THREE.Color(0xffe279); // Golden light

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const chosenColor = Math.random() > 0.4 ? color1 : color2;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(delta) {
    // Animate clouds slowly
    if (this.cloudGroup) {
      this.cloudGroup.rotation.y += delta * 0.015;
    }

    // Animate Zonai particles floating upwards
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 2.5;
        if (positions[i] > 80) positions[i] = 0;
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

