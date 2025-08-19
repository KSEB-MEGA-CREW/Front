import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Model({ avatarUrl, animationUrl }) {
  const group = useRef();
  const { scene } = useGLTF(avatarUrl);
  const { animations } = useGLTF(animationUrl);
  const mixer = useRef();

  useEffect(() => {
    if (animations && animations.length) {
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
    }
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [animations, scene]);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  // eslint-disable-next-line react/no-unknown-property
  return <primitive ref={group} object={scene} dispose={null} />;
}

export default function AvatarViewer() {
  return (
    <Canvas camera={{ position: [2, 2, 3], fov: 50 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.5} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model avatarUrl="/avatar.glb" animationUrl="/만나서_반갑습니다.glb" />
      <OrbitControls />
    </Canvas>
  );
}