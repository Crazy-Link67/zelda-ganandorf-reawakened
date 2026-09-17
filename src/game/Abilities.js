import * as THREE from 'three';
import { sound } from '../engine/Audio.js';
import { inventory } from './Inventory.js';

export class AbilitiesManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Ultrahand state
    this.ultrahandActive = false;
    this.grabbedObject = null;
    this.grabDistance = 6.0;
    this.raycaster = new THREE.Raycaster();

    // Ultrahand visual beam (Zonai swirling green cylinder / curve)
    this.setupUltrahandVisuals();

    // Interactive physics objects for Ultrahand
    this.interactableObjects = [];
  }

  setupUltrahandVisuals() {
    // Glowing emerald green beam
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(60 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.beamMaterial = new THREE.LineBasicMaterial({
      color: 0x33ffaa,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });

    this.beamLine = new THREE.Line(lineGeo, this.beamMaterial);
    this.beamLine.visible = false;
    this.scene.add(this.beamLine);

    // Reticle ring for Ultrahand targeting
    const ringGeo = new THREE.RingGeometry(0.3, 0.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x33ffaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    this.ultrahandReticle = new THREE.Mesh(ringGeo, ringMat);
    this.ultrahandReticle.visible = false;
    this.scene.add(this.ultrahandReticle);
  }

  registerInteractable(obj) {
    this.interactableObjects.push(obj);
  }

  toggleUltrahand(playerHandPos) {
    this.ultrahandActive = !this.ultrahandActive;
    if (this.ultrahandActive) {
      sound.playUltrahandHum();
      this.beamLine.visible = true;
      this.ultrahandReticle.visible = true;
    } else {
      this.releaseObject();
      this.beamLine.visible = false;
      this.ultrahandReticle.visible = false;
    }
  }

  releaseObject() {
    if (this.grabbedObject) {
      if (this.grabbedObject.material && this.grabbedObject.originalMaterial) {
        this.grabbedObject.material = this.grabbedObject.originalMaterial;
      }
      this.grabbedObject = null;
    }
  }

  update(delta, input, playerHandPos, cameraForward) {
    if (!this.ultrahandActive) return;

    // Cast ray from camera center
    this.raycaster.set(this.camera.position, cameraForward);

    if (!this.grabbedObject) {
      // Find object to grab
      const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);

      if (intersects.length > 0 && intersects[0].distance < 16) {
        let hitMesh = intersects[0].object;
        while (hitMesh.parent && !hitMesh.userData.isGrabbable && hitMesh.parent !== this.scene) {
          hitMesh = hitMesh.parent;
        }

        if (hitMesh.userData.isGrabbable) {
          this.ultrahandReticle.position.copy(intersects[0].point);
          this.ultrahandReticle.lookAt(this.camera.position);

          if (input.interactPressed || input.mouse.leftClicked) {
            this.grabbedObject = hitMesh;
            this.grabDistance = Math.max(3.5, intersects[0].distance);
            sound.playUltrahandHum();
          }
        }
      } else {
        this.ultrahandReticle.position.copy(playerHandPos).add(cameraForward.clone().multiplyScalar(5));
        this.ultrahandReticle.lookAt(this.camera.position);
      }
    } else {
      // Manipulate grabbed object
      if (input.mouse.wheel !== 0) {
        this.grabDistance = Math.max(2.5, Math.min(18.0, this.grabDistance - input.mouse.wheel * 0.8));
      }

      // Rotate with right click
      if (input.mouse.rightDown) {
        this.grabbedObject.rotation.y += input.mouse.dx * 0.01;
        this.grabbedObject.rotation.x += input.mouse.dy * 0.01;
      }

      // Desired position
      const desiredPos = this.camera.position.clone().add(cameraForward.clone().multiplyScalar(this.grabDistance));
      this.grabbedObject.position.lerp(desiredPos, delta * 12);

      // Release on click
      if (input.interactPressed || (input.mouse.leftClicked && !input.mouse.rightDown)) {
        this.releaseObject();
        sound.playFuseChime();
      }
    }

    // Update glowing green Ultrahand energy beam
    this.updateBeam(playerHandPos, this.grabbedObject ? this.grabbedObject.position : this.ultrahandReticle.position);
  }

  updateBeam(startPos, endPos) {
    const points = [];
    const count = 30;
    const mid = startPos.clone().lerp(endPos, 0.5);
    mid.y += 0.8 * Math.sin(Date.now() * 0.005); // wavy energy wave

    const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
    const curvePoints = curve.getPoints(count);

    const positions = this.beamLine.geometry.attributes.position.array;
    for (let i = 0; i < curvePoints.length; i++) {
      positions[i * 3] = curvePoints[i].x;
      positions[i * 3 + 1] = curvePoints[i].y;
      positions[i * 3 + 2] = curvePoints[i].z;
    }
    this.beamLine.geometry.attributes.position.needsUpdate = true;
  }

  performFuse(materialIndex = 0) {
    const fusedWeapon = inventory.fuseMaterialToWeapon(0, materialIndex);
    if (fusedWeapon) {
      sound.playFuseChime();
      return true;
    }
    return false;
  }
}

