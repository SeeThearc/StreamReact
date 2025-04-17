import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Model = () => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Create lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create a glowing sphere
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.5,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Create orbital rings
    const createRing = (radius, color) => {
      const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      return ring;
    };

    const ring1 = createRing(2.2, 0xff6b6b);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = createRing(2.5, 0x5865f2);
    ring2.rotation.x = Math.PI / 4;
    scene.add(ring2);

    const ring3 = createRing(2.8, 0x8b5cf6);
    ring3.rotation.x = Math.PI / 6;
    ring3.rotation.y = Math.PI / 3;
    scene.add(ring3);

    // Animation variables
    let frame = 0;

    // Handle window resize
    const handleResize = () => {
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frame = requestAnimationFrame(animate);

      // Rotate sphere
      sphere.rotation.y += 0.005;

      // Rotate rings at different speeds
      ring1.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;
      ring3.rotation.z += 0.001;

      // Add subtle floating animation
      sphere.position.y = Math.sin(Date.now() * 0.001) * 0.1;

      renderer.render(scene, camera);
    };

    // Start animation after a short delay to allow for proper mounting
    setTimeout(() => {
      setIsLoading(false);
      animate();
    }, 500);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="model-container" ref={mountRef}>
      {isLoading && (
        <div className="loading-indicator">
          <div className="model-icon">⏳</div>
          <p>Loading 3D Model...</p>
        </div>
      )}
    </div>
  );
};

export default Model;
