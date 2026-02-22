/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type ReactNode } from "react";
// import { rgbeLoader } from './CanvasGPU';
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  DirectionalLight,
  // EquirectangularReflectionMapping,
  Object3D,
  UnsignedByteType,
} from "three";
import { PostProcessing, SRGBColorSpace } from "three/webgpu";
import {
  pass,
  mrt,
  output,
  normalView,
  add,
  directionToColor,
  colorToDirection,
  sample,
  // float,
  // mix,
  // blendColor,
  colorSpaceToWorking,
  roughness,
  metalness,
  vec2,
} from "three/tsl";

// import { ssr } from "three/addons/tsl/display/SSRNode.js";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
// import { traa } from "three/addons/tsl/display/TRAANode.js";
import { fxaa } from "three/addons/tsl/display/FXAANode.js";
// import { useAppState } from '../World/useAppState';

export function BloomPipeline() {
  const [sun, setSun] = useState<any>(null);
  const scene = useThree((r) => r.scene);
  const camera = useThree((r) => r.camera);
  const renderer = useThree((r) => r.gl);

  const [fnc, setFnc] = useState(() => {
    return () => {
      renderer.render(scene, camera);
    };
  });

  useEffect(() => {
    if (!scene) {
      return;
    }

    const object: any = new Object3D();

    const dirL = new DirectionalLight(0xffffff, 2);
    dirL.position.set(-20, 10, 10);

    object.sunLight = dirL;
    object.sunLight.castShadow = true;

    object.add(object.sunLight);
    object.add(object.sunLight.target);

    object.sunLight.castShadow = true;
    object.sunLight.shadow.camera.near = 0;
    object.sunLight.shadow.camera.far = 150 * 2 * 100;

    object.sunLight.shadow.camera.left = -5.123 * 8 * 100;
    object.sunLight.shadow.camera.right = 5.123 * 8 * 100;
    object.sunLight.shadow.camera.bottom = -5.123 * 8 * 100;
    object.sunLight.shadow.camera.top = 5.123 * 8 * 100;

    object.sunLight.shadow.mapSize.width = 1024;
    object.sunLight.shadow.mapSize.height = 1024;
    object.sunLight.shadow.radius = 1;
    object.sunLight.shadow.bias = -0.0005;

    const dirR = new DirectionalLight(0xffffff, 2);
    dirR.position.set(20, 10, -10);

    object.moonLight = dirR;
    object.moonLight.castShadow = false;

    object.add(object.moonLight);
    object.add(object.moonLight.target);

    object.moonLight.castShadow = false;
    object.moonLight.shadow.camera.near = 0;
    object.moonLight.shadow.camera.far = 150 * 2 * 100;

    object.moonLight.shadow.camera.left = -5.123 * 8 * 100;
    object.moonLight.shadow.camera.right = 5.123 * 8 * 100;
    object.moonLight.shadow.camera.bottom = -5.123 * 8 * 100;
    object.moonLight.shadow.camera.top = 5.123 * 8 * 100;

    object.moonLight.shadow.mapSize.width = 1024;
    object.moonLight.shadow.mapSize.height = 1024;
    object.moonLight.shadow.radius = 1;
    object.moonLight.shadow.bias = -0.0005;

    //
    object.sunLight.shadow.intensity = 2;
    object.sunLight.intensity = 1.0;
    object.moonLight.shadow.intensity = 2;
    object.moonLight.intensity = 1.0;

    const scenePass = pass(scene, camera);
    scenePass.setMRT(
      mrt({
        output: output,
        // normal: directionToColor(normalView),
        // metalrough: vec2(metalness, roughness), // pack metalness and roughness into a single attachment
      }),
    );

    const scenePassColor = scenePass
      .getTextureNode("output")
      .toInspector("Color");

    // const scenePassNormal = scenePass
    //   .getTextureNode("normal")
    //   .toInspector("Normal", (node) => {
    //     return colorSpaceToWorking(node, SRGBColorSpace);
    //   });

    // const scenePassDepth = scenePass
    //   .getTextureNode("depth")
    //   .toInspector("Depth", () => {
    //     return scenePass.getLinearDepthNode();
    //   });
    // const scenePassMetalRough = scenePass
    //   .getTextureNode("metalrough")
    //   .toInspector("Metalness-Roughness");
    // const sceneNormal = sample((uv) => {
    //   return colorToDirection(scenePassNormal.sample(uv));
    // });

    //

    // optional: optimize bandwidth by reducing the texture precision for normals and metal/roughness

    // const normalTexture = scenePass.getTexture("normal");
    // normalTexture.type = UnsignedByteType;

    // const metalRoughTexture = scenePass.getTexture("metalrough");
    // metalRoughTexture.type = UnsignedByteType;

    // const ssrPass = ssr(
    //   scenePassColor,
    //   scenePassDepth,
    //   sceneNormal,
    //   scenePassMetalRough.r,
    //   scenePassMetalRough.g,
    // ).toInspector("SSR");

    // // gi
    // const giPass = ssgi(
    // 	scenePassColor,
    // 	scenePassDepth,
    // 	sceneNormal,
    // 	camera as any,
    // );
    // giPass.sliceCount.value = 2;
    // giPass.stepCount.value = 8;
    // giPass.backfaceLighting.value = 1;
    // giPass.radius.value = 25;
    // giPass.thickness.value = 2;

    // // composite
    // const gi = giPass.rgb;
    // const ao = giPass.a;

    // const compositePass = vec4(
    // 	add(scenePassColor.rgb.mul(ao), scenePassDiffuse.rgb.mul(gi)),
    // 	scenePassColor.a,
    // );
    // compositePass.name = "Composite";

    // // traa
    // const traaPass = traa(
    // 	compositePass,
    // 	scenePassDepth,
    // 	scenePassVelocity,
    // 	camera,
    // );

    const postProcessing = new PostProcessing(renderer as any);

    const aaColor = fxaa(scenePassColor);

    const bloomPass = bloom(scenePassColor, 0.5, 1.0, 1.0);

    postProcessing.outputNode = add(aaColor, bloomPass.mul(1.0));

    postProcessing.needsUpdate = true;

    // rgbeLoader.loadAsync(url).then((texture) => {
    //
    //   texture.mapping = EquirectangularReflectionMapping;
    //   scene.background = texture;
    //   scene.environment = texture;
    //   useAppState.setState({ visible: true });
    //
    // });

    setSun(
      <group name="light-player-target">
        <primitive object={object}></primitive>
      </group>,
    );

    setFnc(() => {
      return () => {
        postProcessing.render();
      };
    });

    return () => {
      postProcessing.dispose();
      object.clear();
    };
  }, [scene]);

  //
  useFrame(() => {
    fnc();
  }, 10);

  return <>{sun}</>;
}
