import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// Scene 1 — Hero 3D Floating Cake (Home Page)
// ----------------------------------------------------------------------
const CakeModel = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t) * 0.2; // Float up and down
      groupRef.current.rotation.y += 0.01; // Rotate slowly
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bottom Layer */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 1, 32]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
      {/* Top Layer */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1, 1, 0.8, 32]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Candles */}
      {[...Array(3)].map((_, i) => (
        <group key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 0.6, 0.8, Math.sin((i * Math.PI * 2) / 3) * 0.6]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
      ))}
      {/* Cherries/Decorations */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 6) * 1.3, 0.1, Math.sin((i * Math.PI * 2) / 6) * 1.3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      ))}
    </group>
  );
};

export const FloatingCake3D = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#fcd34d" />
        <directionalLight position={[-2, 5, 2]} intensity={0.5} />
        <CakeModel />
      </Canvas>
    </div>
  );
};

// ----------------------------------------------------------------------
// Scene 2 — Rotating Pastry Icons (Shop Page Banner)
// ----------------------------------------------------------------------
const FloatingShape = ({ position, color, geometry, offset }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 2 + offset) * 0.2;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export const FloatingIcons3D = () => {
  return (
    <div className="w-full h-[120px] hidden md:block">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 2]} intensity={1} />
        
        {/* Torus (Donut) */}
        <FloatingShape position={[-3, 0, 0]} color="#fcd34d" geometry={<torusGeometry args={[0.3, 0.15, 16, 32]} />} offset={0} />
        {/* Sphere (Bun) */}
        <FloatingShape position={[-1.5, 0, 0]} color="#fed7aa" geometry={<sphereGeometry args={[0.35, 32, 32]} />} offset={1} />
        {/* Flat Cylinder (Cake) */}
        <FloatingShape position={[0, 0, 0]} color="#fde68a" geometry={<cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />} offset={2} />
        {/* Box (Bread Loaf) */}
        <FloatingShape position={[1.5, 0, 0]} color="#d97706" geometry={<boxGeometry args={[0.5, 0.3, 0.4]} />} offset={3} />
        {/* Icosahedron (Star-like) */}
        <FloatingShape position={[3, 0, 0]} color="#f59e0b" geometry={<icosahedronGeometry args={[0.35, 0]} />} offset={4} />
      </Canvas>
    </div>
  );
};

// ----------------------------------------------------------------------
// Scene 3 — Animated Background Particles (Login and Signup Pages)
// ----------------------------------------------------------------------
const Particles = () => {
  const count = 80;
  const meshRef = useRef();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10 - 5;
      const speedX = (Math.random() - 0.5) * 0.02;
      const speedY = (Math.random() - 0.5) * 0.02;
      temp.push({ x, y, z, speedX, speedY });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (meshRef.current) {
      particles.forEach((particle, i) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce back
        if (particle.x > 10 || particle.x < -10) particle.speedX *= -1;
        if (particle.y > 10 || particle.y < -10) particle.speedY *= -1;

        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#fcd34d" transparent opacity={0.6} />
    </instancedMesh>
  );
};

export const ParticleBackground3D = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
    </div>
  );
};

// ----------------------------------------------------------------------
// Scene 4 — Order Success Confetti (Order Confirmation Page)
// ----------------------------------------------------------------------
const Confetti = () => {
  const count = 60;
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => ['#f59e0b', '#ffffff', '#111827', '#22c55e'], []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 10 + 5, // Start above the screen
        z: (Math.random() - 0.5) * 5,
        speedY: Math.random() * 0.05 + 0.02,
        speedX: (Math.random() - 0.5) * 0.02,
        rotSpeedX: Math.random() * 0.1,
        rotSpeedY: Math.random() * 0.1,
        colorIndex: Math.floor(Math.random() * colors.length),
      });
    }
    return temp;
  }, [count, colors.length]);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      const color = new THREE.Color(colors[p.colorIndex]);
      color.toArray(arr, i * 3);
    });
    return arr;
  }, [particles, colors]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (t > 3) return; // Stop after 3 seconds

    particles.forEach((p, i) => {
      p.y -= p.speedY;
      p.x += p.speedX;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(t * p.rotSpeedX, t * p.rotSpeedY, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <planeGeometry args={[0.2, 0.4]} />
      <meshBasicMaterial side={THREE.DoubleSide}>
        <instancedBufferAttribute attach="color" args={[colorArray, 3]} />
      </meshBasicMaterial>
    </instancedMesh>
  );
};

export const ConfettiScene3D = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Confetti />
      </Canvas>
    </div>
  );
};
