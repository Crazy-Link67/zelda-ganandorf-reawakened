import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );

    this.target = new THREE.Vector3(0, 50, 0);
    this.pitch = 0.2; // vertical angle
    this.yaw = 0;     // horizontal angle
    this.distance = 5.5;
    this.targetDistance = 5.5;

    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Mode offsets
    this.mode = 'normal'; // 'normal' | 'diving' | 'gliding' | 'aiming'

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  update(delta, input, playerPos, playerState) {
    // Handle mouse rotation
    const sensitivity = 0.0025;
    this.yaw -= input.mouse.dx * sensitivity;
    this.pitch -= input.mouse.dy * sensitivity;

    // Pitch constraints
    this.pitch = Math.max(-0.65, Math.min(1.2, this.pitch));

    // Wheel zoom
    if (input.mouse.wheel !== 0) {
      this.targetDistance = Math.max(2.5, Math.min(12.0, this.targetDistance + input.mouse.wheel * 0.8));
    }

    // Determine camera mode and desired distance/height
    let desiredDist = this.targetDistance;
    let heightOffset = 1.6;
    let shoulderOffset = 0;

    if (playerState === 'diving') {
      desiredDist = 9.0;
      heightOffset = 3.0;
      this.pitch = Math.max(0.7, this.pitch); // Pitch down during dive
    } else if (playerState === 'gliding') {
      desiredDist = 7.0;
      heightOffset = 2.2;
    } else if (playerState === 'aiming') {
      desiredDist = 2.2;
      heightOffset = 1.5;
      shoulderOffset = 0.7; // Over right shoulder
    }

    // Smooth distance
    this.distance += (desiredDist - this.distance) * Math.min(1.0, delta * 6.0);

    // Compute target center
    const targetCenter = playerPos.clone().add(new THREE.Vector3(0, heightOffset, 0));

    // Calculate camera offset
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const rightVec = new THREE.Vector3(cosYaw, 0, -sinYaw).normalize();
    const desiredPos = targetCenter.clone()
      .add(new THREE.Vector3(
        sinYaw * cosPitch * this.distance,
        sinPitch * this.distance,
        cosYaw * cosPitch * this.distance
      ))
      .add(rightVec.multiplyScalar(shoulderOffset));

    // Smooth position
    this.currentPosition.lerp(desiredPos, Math.min(1.0, delta * 12.0));
    this.currentLookAt.lerp(targetCenter, Math.min(1.0, delta * 12.0));

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  getForwardVector() {
    return new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    ).normalize();
  }

  getRightVector() {
    return new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    ).normalize();
  }
}

