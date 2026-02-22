import "./App.css";
import { Suspense, useEffect, useRef } from "react";
import { CanvasGPU } from "./CanvasGPU/CanvasGPU.tsx";
import {
  Environment,
  Gltf,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { DiamindComponent } from "./DiamondTSL/DiamondComponent.tsx";
import { BloomPipeline } from "./CanvasGPU/BloomPipeline.tsx";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, FogExp2, Matrix4, Object3D, Scene } from "three";
import { color, fog, rangeFog, rangeFogFactor } from "three/tsl";

const m4 = new Matrix4().fromArray([
  0.9840423933287578, 1.0408340855860843e-17, 0.1779341679717821, 0,
  0.05954104347474225, 0.9423517267593705, -0.3292842043213908, 0,
  -0.16767657043770076, 0.33462400253662705, 0.9273140485577785, 0,
  -136.6004999600759, 272.606995275635, 755.4517743435046, 1,
]);

const o3 = new Object3D();
m4.decompose(o3.position, o3.quaternion, o3.scale);
const display = <primitive object={o3}></primitive>;
function App() {
  return (
    <>
      <CanvasGPU webgpu>
        <Fog></Fog>
        {/* <color attach="background" args={["#ffffff"]} /> */}
        <Suspense fallback={null}>
          {display}
          {/* <Environment
            background
            backgroundIntensity={1.15}
            files={[`/hdr/sky.hdr`]}
          /> */}

          {/* <Spinner>
            <DiamindComponent />
          </Spinner> */}

          <Gltf scale={1} src={`/config/hongkong-transformed.glb`}></Gltf>
          {/* <PerspectiveCamera
            fov={50}
            far={1000}
            near={1}
            position={o3.position.toArray()}
            quaternion={o3.quaternion.toArray()}
            scale={o3.scale.toArray()}
          ></PerspectiveCamera> */}
          <OrbitControls
            object-position={o3.position.toArray()}
            object-quaternion={o3.quaternion.toArray()}
            object-scale={o3.scale.toArray()}
            makeDefault
          ></OrbitControls>
          {/* <OrbitControlsobject-position={[0, 2, 1]} /> */}

          <BloomPipeline />
        </Suspense>
      </CanvasGPU>
    </>
  );
}
function Fog() {
  const scene: any = useThree((r) => r.scene);
  useEffect(() => {
    if (!scene) {
      return;
    }
    if (scene) {
      scene.fogNode = fog(
        color(new Color("#a8a8a8")),
        rangeFogFactor(300, 1500),
      );
      scene.background = new Color("#a7a7a7");
    }
  }, [scene]);
  return null;
}
//

function Spinner({ children }: any) {
  const ref = useRef<any>(null);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.125;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export default App;
