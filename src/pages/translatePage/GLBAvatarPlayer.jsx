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
  autoPlay = false,
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

    // 이전 애니메이션 정리
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }
    if (actionRef.current) {
      actionRef.current = null;
    }

    // GLB 애니메이션 데이터 유효성 검사
    if (!animGltf.animations || animGltf.animations.length === 0) {
      console.warn("애니메이션 데이터가 없습니다:", animationUrl);
      onEnd?.();
      return;
    }

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
      // 화면에 렌더링되는 아바타 씬에 애니메이션 적용
      try {
        action = mixer.clipAction(clip, avatarScene);
      } catch (avatarError) {
        try {
          action = mixer.clipAction(clip, animGltf.scene);
        } catch (sceneError) {
          action = mixer.clipAction(clip);
        }
      }
      
      if (action) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopRepeat; // 반복 재생으로 변경
        action.repetitions = 3; // 3번 반복
        action.timeScale = 0.5; // 속도를 50%로 낮춤 (더 느리게)
        action.enabled = true;
        actionRef.current = action;
        
        // 애니메이션 액션이 설정되었고 play가 true이거나 autoPlay가 true이면 즉시 재생
        if (play || autoPlay) {
          setTimeout(() => {
            if (action && !action.isRunning()) {
              action.reset().play();
            }
          }, 100);
        }
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
    if (!action) {
      return;
    }

    if (play) {
      // 이미 재생 중인 경우 중복 실행 방지
      if (action.isRunning() && action.time > 0.1) {
        return;
      }
      
      // 애니메이션 설정 재적용 (반복 및 속도)
      action.loop = THREE.LoopRepeat;
      action.repetitions = 3;
      action.timeScale = 0.5;
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

        <React.Suspense fallback={<Html center />}>
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

// GLB 파일 preloading
try {
  useGLTF.preload("/avatar.glb");
  useGLTF.preload("/만나서_반갑습니다.glb");
} catch (error) {
  console.warn("GLB 파일 프리로딩 실패:", error);
}