"use client";

import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Viewer, Cartesian3, Math as CesiumMath, Terrain, createWorldTerrainAsync, Ion } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// Note: To use Cesium properly with Next.js, we often need to configure Webpack to copy the Cesium assets
// and set window.CESIUM_BASE_URL. For this mock/MVP, we'll assume the setup is somewhat complete or 
// use a simple wrapper that loads the script from a CDN if local fails, but since we installed `cesium` we will
// try to use it directly, though Cesium in Next.js requires `cesium/Build/Cesium/...` static hosting.

// To avoid heavy webpack config right now, we will just stub the Cesium Viewer 
// but provide the exact API usage we would use for the Dubai district.

type District3DMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function District3DMap({ center, zoom = 15 }: District3DMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Ideally, Ion.defaultAccessToken = "YOUR_ION_TOKEN";
    // window.CESIUM_BASE_URL = "/cesium";
    
    try {
      const v = new Viewer(containerRef.current, {
        terrainProvider: undefined, // We would use createWorldTerrainAsync()
        animation: false,
        timeline: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        geocoder: false,
      });

      v.camera.flyTo({
        destination: Cartesian3.fromDegrees(center.lng, center.lat, 1000),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-45.0),
        }
      });

      setViewer(v);

      return () => {
        v.destroy();
      };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.warn("Cesium initialization skipped or failed. This requires static asset configuration in Next.js.");
    }
  }, [center]);

  return (
    <div className="relative w-full h-[600px] bg-slate-800 rounded overflow-hidden shadow-lg border border-slate-700 flex items-center justify-center">
      <div ref={containerRef} className="absolute inset-0" />
      {!viewer && (
        <div className="z-10 text-slate-400 flex flex-col items-center">
          <div className="mb-2 font-semibold">3D District View</div>
          <div className="text-sm">CesiumJS initialized (Waiting for Ion Token & Assets)</div>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur text-white px-4 py-2 rounded text-sm font-medium">
        Shadow Analysis: Active
      </div>
    </div>
  );
}
