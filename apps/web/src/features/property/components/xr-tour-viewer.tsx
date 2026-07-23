"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html, useProgress } from "@react-three/drei";

type XRTourViewerProps = {
  gltfUrl: string;
  onError?: (err: Error) => void;
};

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Optional: Center and scale the model here if needed
  return <primitive object={scene} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-black/80 text-white rounded whitespace-nowrap">
        <div className="text-sm font-semibold mb-2">Loading 3D Model...</div>
        <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Html>
  );
}

export function XRTourViewer({ gltfUrl, onError }: XRTourViewerProps) {
  return (
    <div className="xrTourViewerContainer relative w-full h-[500px] bg-slate-900 rounded overflow-hidden shadow-inner">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#1a1c23"]} />
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="city" />
        
        <Suspense fallback={<Loader />}>
          <Model url={gltfUrl} />
        </Suspense>

        <OrbitControls 
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={50}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-none font-medium">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}

// Preload common model if needed
// useGLTF.preload('/sample-model.glb');
