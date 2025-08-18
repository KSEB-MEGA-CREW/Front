// GLBAvatarPlayer.jsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

function AvatarWithAnimation({ avatarUrl, animationUrl, play }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();

  // GLB 로드
  const { scene: avatarSceneRaw } = useGLTF(avatarUrl);
  const animGltf = useGLTF(animationUrl);

  // 아바타는 안전하게 clone (공유 재질/스켈레톤 문제 방지)
  const avatarScene = useMemo(() => SkeletonUtils.clone(avatarSceneRaw), [avatarSceneRaw]);

  // 그림자 설정
  useEffect(() => {
    avatarScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [avatarScene]);

  // 애니메이션 Mixer 준비 & 클립 리타게팅(필요 시)
  useEffect(() => {
    const mixer = new THREE.AnimationMixer(avatarScene);
    mixerRef.current = mixer;

    let action;

    const srcClips = (animGltf && animGltf.animations) ? animGltf.animations : [];
    // 기본적으로 첫 번째 클립 사용
    const clip = srcClips[0];

    if (clip) {
      // skeleton 구조가 동일/유사하면 retargetClip으로 대상 스켈레톤에 맞춰 animation 복사
      // (만약 두 GLB가 동일 리그/이름 체계를 공유한다면 바로 잘 맞습니다.)
      let retargeted;
      try {
        // target = avatarScene, source = animGltf.scene (관례적으로 이렇게 사용)
        retargeted = SkeletonUtils.retargetClip(avatarScene, animGltf.scene || avatarScene, clip);
      } catch (error) {
        console.error("Failed to retarget animation, using original clip.", error);
        // retarget 실패 시 원본 클립 그대로 시도 (이름이 일치할 때는 이것만으로도 동작)
        retargeted = clip;
      }

      action = mixer.clipAction(retargeted, avatarScene);
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
      action.enabled = true;
      actionRef.current = action;
    }

    return () => {
      mixer.stopAllAction();
      actionRef.current = null;
      mixerRef.current = null;
    };
  }, [avatarScene, animGltf]);

  // 외부에서 넘어오는 play 신호로 재생/정지
  useEffect(() => {
    const action = actionRef.current;
    if (!action) return;

    if (play) {
      action.reset().play();
    } else {
      // 원 코드가 3초 후 isPlaying=false로 바꾸므로, false 시 정지
      action.stop();
    }
  }, [play]);

  // 매 프레임 mixer 업데이트
  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return (
    // eslint-disable-next-line react/no-unknown-property
    <group ref={groupRef} dispose={null}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <primitive object={avatarScene} />
    </group>
  );
}

export default function GLBAvatarPlayer({
  avatarUrl = "/avatar.glb",
  animationUrl = "/만나서_반갑습니다.glb",
  play = false,
  dark = false,
}) {
  // Canvas를 부모 컨테이너에 딱 맞추도록 100% 레이아웃
  // 그림자, 조명, 카메라 컨트롤 포함
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 2.5], fov: 50, near: 0.1, far: 100 }}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <color attach="background" args={[dark ? "#0b0f19" : "#f6f7fb"]} />
        {/* --- 조명 개선 --- */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <hemisphereLight intensity={1} />
        <directionalLight
          // eslint-disable-next-line react/no-unknown-property
          position={[5, 5, 5]}
          // eslint-disable-next-line react/no-unknown-property
          intensity={1.5}
          // eslint-disable-next-line react/no-unknown-property
          castShadow
          // eslint-disable-next-line react/no-unknown-property
          shadow-mapSize-width={1024}
          // eslint-disable-next-line react/no-unknown-property
          shadow-mapSize-height={1024}
        />
        {/* 바닥 그림자 */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={dark ? 0.24 : 0.16} />
        </mesh>

        <React.Suspense
          fallback={
            <Html center>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: dark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  fontWeight: 700,
                }}
              >
                GLB 로딩 중…
              </div>
            </Html>
          }
        >
          <AvatarWithAnimation
            avatarUrl={avatarUrl}
            animationUrl={animationUrl}
            play={play}
          />
        </React.Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}

// Drei의 GLTF preloading (선택)
useGLTF.preload("/avatar.glb");
useGLTF.preload("/만나서_반갑습니다.glb");