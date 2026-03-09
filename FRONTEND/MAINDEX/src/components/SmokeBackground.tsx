import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import * as THREE from "three";

const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

export function SmokeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let clock: THREE.Clock;
    let smokeTexture: THREE.Texture;
    let smokeMaterial: THREE.MeshLambertMaterial;
    let smokeMaterialGray: THREE.MeshLambertMaterial;
    let smokeMaterialWhite: THREE.MeshLambertMaterial;
    let smokeGeo: THREE.PlaneGeometry;
    let smokeParticles: THREE.Mesh[] = [];
    let animationId: number;

    function init() {
      clock = new THREE.Clock();

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();
      scene.background = null;

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      const light = new THREE.DirectionalLight(0xffffff, 1.2);
      light.position.set(-1, 0, 1);
      scene.add(light);
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const textureLoader = new THREE.TextureLoader();
      smokeTexture = textureLoader.load("/Smoke-Element.png"); // Make sure this asset exists in public folder!

      smokeMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color("#E11D2E"),
        map: smokeTexture,
        transparent: true,
        opacity: 0.6,
      });
      smokeMaterialGray = new THREE.MeshLambertMaterial({
        color: new THREE.Color("#b0b0b0"),
        map: smokeTexture,
        transparent: true,
        opacity: 0.55,
      });
      smokeMaterialWhite = new THREE.MeshLambertMaterial({
        color: new THREE.Color("#fafafa"),
        map: smokeTexture,
        transparent: true,
        opacity: 0.75,
      });
      smokeGeo = new THREE.PlaneGeometry(300, 300);

      for (let p = 0; p < 180; p++) {
        const r = Math.random();
        const material = r < 0.65 ? smokeMaterialWhite : r < 0.85 ? smokeMaterialGray : smokeMaterial;
        const particle = new THREE.Mesh(smokeGeo, material);
        particle.position.set(
          Math.random() * 500 - 250,
          Math.random() * 500 - 250,
          Math.random() * 1000 - 100
        );
        particle.rotation.z = Math.random() * 360;
        scene.add(particle);
        smokeParticles.push(particle);
      }

      container.appendChild(renderer.domElement);
    }

    function animate() {
      const delta = clock.getDelta();
      animationId = requestAnimationFrame(animate);
      evolveSmoke(delta);
      render();
    }

    function evolveSmoke(delta: number) {
      for (let sp = smokeParticles.length - 1; sp >= 0; sp--) {
        smokeParticles[sp].rotation.z += delta * 0.2;
      }
    }

    function render() {
      renderer.setClearColor(0x000000, 0);
      renderer.render(scene, camera);
    }

    function handleResize() {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    init();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      smokeParticles.forEach((p) => scene.remove(p));
      smokeTexture.dispose();
      smokeMaterial.dispose();
      smokeMaterialGray.dispose();
      smokeMaterialWhite.dispose();
      smokeGeo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <Container ref={containerRef} aria-hidden />;
}
