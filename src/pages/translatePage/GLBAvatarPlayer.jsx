import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

function AvatarWithAnimation({
  avatarUrl,
  animationUrl,
  play,
  onEnd,
  zoom = 1,
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();

  const { scene: avatarSceneRaw } = useGLTF(avatarUrl);
  const animGltf = useGLTF(animationUrl);

  const avatarScene = useMemo(
    () => SkeletonUtils.clone(avatarSceneRaw),
    [avatarSceneRaw]
  );

  useEffect(() => {
    if (!avatarScene) return;
    
    avatarScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [avatarScene]);

  useEffect(() => {
    if (!avatarScene || !animGltf) return;

    const mixer = new THREE.AnimationMixer(avatarScene);
    mixerRef.current = mixer;

    const onFinished = (e) => {
      if (e.action === actionRef.current) {
        onEnd?.();
      }
    };
    mixer.addEventListener("finished", onFinished);

    let action;
    const srcClips = animGltf?.animations || [];
    const clip = srcClips[0];

    if (clip) {
      let retargeted;
      try {
        // 안전한 retargeting을 위한 검증 추가
        const targetSkeleton = avatarScene;
        const sourceSkeleton = animGltf.scene;
        
        // 스켈레톤 구조 검증
        if (targetSkeleton && sourceSkeleton) {
          // bones 속성이 존재하는지 확인
          let hasValidBones = false;
          targetSkeleton.traverse((obj) => {
            if (obj.isSkinnedMesh && obj.skeleton && obj.skeleton.bones) {
              hasValidBones = true;
            }
          });

          if (hasValidBones) {
            retargeted = SkeletonUtils.retargetClip(
              targetSkeleton,
              sourceSkeleton,
              clip
            );
          } else {
            console.warn("스켈레톤 구조를 찾을 수 없어 원본 클립 사용");
            retargeted = clip;
          }
        } else {
          console.warn("아바타 또는 애니메이션 씬을 찾을 수 없음");
          retargeted = clip;
        }
      } catch (error) {
        console.warn("애니메이션 리타겟팅 실패, 원본 클립 사용:", error.message);
        retargeted = clip;
      }

      if (retargeted) {
        action = mixer.clipAction(retargeted, avatarScene);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        action.enabled = true;
        actionRef.current = action;
      }
    }

    return () => {
      if (mixer) {
        mixer.removeEventListener("finished", onFinished);
        mixer.stopAllAction();
      }
      actionRef.current = null;
      mixerRef.current = null;
    };
  }, [avatarScene, animGltf, onEnd]);

  // 외부에서 넘어오는 play 신호로 재생/정지
  useEffect(() => {
    const action = actionRef.current;
    if (!action) return;

    if (play) {
      action.reset().play();
    } else {
      action.stop();
    }
  }, [play]);

  // 줌 효과 적용
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(zoom);
    }
  }, [zoom]);

  // 매 프레임 mixer 업데이트
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  if (!avatarScene) {
    return null;
  }

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={avatarScene} />
    </group>
  );
}

// 카메라 줌 컨트롤러
function CameraController({ zoom }) {
  const { camera } = useThree();
  const basePosition = useRef([0, 1.5, 2.5]);

  useEffect(() => {
    // 줌에 따라 카메라 거리 조절 (줌 인하면 가까이, 줌 아웃하면 멀리)
    const [x, y, z] = basePosition.current;
    const distance = 1 / zoom; // 역수로 거리 계산
    camera.position.set(x * distance, y, z * distance);
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  return null;
}

export default function GLBAvatarPlayer({
  avatarUrl = "/avatar.glb",
  animationUrl = "/만나서_반갑습니다.glb",
  play = false,
  dark = false,
  zoom = 1,
  onEnd,
}) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 2.5], fov: 50, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          // WebGL 컨텍스트 최적화
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <color attach="background" args={[dark ? "#0b0f19" : "#f6f7fb"]} />
        
        {/* 조명 개선 */}
        <ambientLight intensity={0.5} />
        <hemisphereLight intensity={1} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* 바닥 그림자 */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={dark ? 0.24 : 0.16} />
        </mesh>

        <React.Suspense
          fallback={
            <Html center>
              {/* <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: dark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  fontWeight: 700,
                  color: dark ? "#e2e8f0" : "#1e293b",
                }}
              >
                아바타 로딩 중…
              </div> */}
            </Html>
          }
        >
          <AvatarWithAnimation
            avatarUrl={avatarUrl}
            animationUrl={animationUrl}
            play={play}
            zoom={zoom}
            onEnd={onEnd}
          />
        </React.Suspense>

        <CameraController zoom={zoom} />
        <OrbitControls enableDamping dampingFactor={0.08} target={[0, 1, 0]} />
      </Canvas>
    </div>
  );
}

// GLB 파일 preloading (에러 처리 추가)
try {
  useGLTF.preload("/avatar.glb");
  useGLTF.preload("/만나서_반갑습니다.glb");
} catch (error) {
  console.warn("GLB 파일 프리로딩 실패:", error);
}