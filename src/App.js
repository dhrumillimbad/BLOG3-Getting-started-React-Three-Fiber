import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  Html,
  Instances,
  Instance,
  OrbitControls,
  Environment,
  useProgress, 
  useGLTF,
  useTexture
} from "@react-three/drei";
import * as THREE from "three";

const color = new THREE.Color();
const randomVector = (r) => [
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
];
const randomEuler = () => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI,
];
const randomData = Array.from({ length: 50 }, (r = 3) => ({
  random: Math.random(),
  position: randomVector(r),
  rotation: randomEuler(),
}));

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

function Box() {
  const [size, set] = useState(0.3);
  const [hidden, setVisible] = useState(false);
  return (
    <mesh scale={size * 2}>
      <boxGeometry />
      <meshStandardMaterial />
      <Html
        style={{
          transition: "all 0.2s",
          opacity: hidden ? 0 : 1,
          transform: `scale(${hidden ? 0.5 : 1})`,
        }}
        distanceFactor={1.5}
        position={[0, 0, 0.51]}
        transform
        occlude
        onOcclude={setVisible}
      >
        <h3>NANI??!!</h3>
      </Html>
    </mesh>
  );
}

function Sphere(props) {
  const colorMap = useTexture("football_texture.jpg");
  const ref = useRef();
  useFrame((state) => {
    ref.current.position.set(
      Math.sin(state.clock.getElapsedTime() / 1.5) / 2,
      Math.cos(state.clock.getElapsedTime() / 1.5) / 2,
      Math.cos(state.clock.getElapsedTime() / 1.5) / 2 + 0.5
    );
    ref.current.rotation.set(
      Math.sin(state.clock.getElapsedTime() / 1.5) / 2 * 5,
      Math.cos(state.clock.getElapsedTime() / 1.5) / 2,
      Math.tan(state.clock.getElapsedTime() / 10.5) / 2
    );
  });
  return (
    <mesh ref={ref} {...props}>
      <sphereGeometry args={[0.2, 30, 30]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}

function Shoes({ range }) {
  const { nodes, materials } = useGLTF("/shoe.glb");
  return (
    <>
      <Instances
        range={range}
        material={materials.phong1SG}
        geometry={nodes.Shoe.geometry}
      >
        {randomData.map((props, i) => (
          <Shoe key={i} {...props} />
        ))}
      </Instances>
    </>
  );
}

function Shoe({ random, ...props }) {
  const ref = useRef();
  const [hovered, setHover] = useState(false);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + random * 10000;
    ref.current.rotation.set(
      Math.cos(t / 4) / 2,
      Math.sin(t / 4) / 2,
      Math.cos(t / 1.5) / 2
    );
    ref.current.position.y = Math.sin(t / 1.5) / 2;
    ref.current.scale.x =
      ref.current.scale.y =
      ref.current.scale.z =
        THREE.MathUtils.lerp(ref.current.scale.z, hovered ? 0.7 : 0.3, 0.1);
    ref.current.color.lerp(
      color.set(hovered ? "red" : "white"),
      hovered ? 1 : 0.1
    );
  });
  return (
    <group {...props}>
      <Instance
        ref={ref}
        onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
        onPointerOut={() => setHover(false)}
      />
    </group>
  );
}

export default function App() {
  return (
    <Canvas  mode="concurrent" dpr={[1, 2]} camera={{ fov: 25 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -10]} />
      <Suspense fallback={<Loader />}>
        <Box />
        <Sphere position={[0, 0, 1]} />
        <Shoes range="5" />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
