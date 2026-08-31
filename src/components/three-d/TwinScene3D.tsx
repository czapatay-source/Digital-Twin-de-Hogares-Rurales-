import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DigitalTwin, Household, ClimateShock, CCTProgram, Country } from '../../types';
import { CloudRain, Sun, Wind, Eye, Zap, Info, RotateCcw } from 'lucide-react';
import { createClimateShock } from '../../lib/scientific/climateEngine';
import { AppDataStore } from '../../lib/store';

interface TwinScene3DProps {
  twins: DigitalTwin[];
  households: Household[];
  country: Country;
  activeScenario: CCTProgram;
  climateShock: ClimateShock;
  onUpdateClimateShock: (shock: ClimateShock) => void;
  onSelectTwin: (twinId: string) => void;
}

export const TwinScene3D: React.FC<TwinScene3DProps> = ({
  twins,
  households,
  country,
  activeScenario,
  climateShock,
  onUpdateClimateShock,
  onSelectTwin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [droughtSlider, setDroughtSlider] = useState<number>(climateShock.intensity);
  const [shockType, setShockType] = useState<string>(climateShock.shockType);
  const [cameraView, setCameraView] = useState<'ISOMETRIC' | 'TOP_DOWN' | 'CLOSEUP'>('ISOMETRIC');

  const selectedTwin = selectedTwinId ? AppDataStore.getDigitalTwinById(selectedTwinId) : null;
  const selectedHH = selectedTwin ? AppDataStore.getHouseholdById(selectedTwin.householdId) : null;

  // Handle Climate Slider Change
  const handleSliderChange = (newIntensity: number) => {
    setDroughtSlider(newIntensity);
    const newShock = createClimateShock(
      (shockType as any) || 'DROUGHT',
      newIntensity,
      6,
      twins[0]?.regionId || 'REG-01'
    );
    onUpdateClimateShock(newShock);
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight || 500;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      climateShock.intensity > 0.6 ? 0x2e1a0e : climateShock.intensity > 0.3 ? 0x1a2233 : 0x0f172a
    );
    scene.fog = new THREE.FogExp2(
      climateShock.intensity > 0.6 ? 0x3d2817 : 0x0f172a,
      0.015
    );

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 30, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(
      climateShock.intensity > 0.5 ? 0xffddaa : 0xccddee,
      0.9
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      climateShock.intensity > 0.5 ? 0xffaa44 : 0xffffff,
      1.4
    );
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Terrain Base Plane
    const terrainGeo = new THREE.PlaneGeometry(70, 70, 32, 32);
    // Displace vertices slightly for terrain elevation
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const elev = Math.sin(vx * 0.1) * Math.cos(vy * 0.1) * 1.5;
      pos.setZ(i, elev);
    }
    terrainGeo.computeVertexNormals();

    // Terrain color depends on climate shock (green vs dry earth)
    const terrainColor =
      climateShock.intensity > 0.6
        ? 0x8b5a2b // Parched earth
        : climateShock.intensity > 0.3
        ? 0x556b2f // Semi-dry grass
        : 0x2e6f40; // Lush green

    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.85,
      metalness: 0.1,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Interactive Twin Objects Group
    const twinMeshesGroup = new THREE.Group();
    scene.add(twinMeshesGroup);

    // Sample subset of 16-24 twins distributed across the 3D landscape
    const displayTwins = twins.slice(0, 20);
    const interactiveObjects: THREE.Object3D[] = [];

    displayTwins.forEach((twin, idx) => {
      const state = twin.simulatedStates[activeScenario.id] || twin.observedState;
      const isPoor = state.isPovertyFGT0;
      
      // Grid positioning with randomized offsets
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const posX = (col - 2) * 12 + (Math.sin(idx * 7) * 2);
      const posZ = (row - 2) * 12 + (Math.cos(idx * 5) * 2);

      const houseGroup = new THREE.Group();
      houseGroup.position.set(posX, 0, posZ);

      // House Walls
      const wallMat = new THREE.MeshStandardMaterial({
        color: isPoor ? 0x94a3b8 : 0xf1f5f9,
        roughness: 0.6,
      });
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), wallMat);
      wallMesh.position.y = 0.9;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      houseGroup.add(wallMesh);

      // House Roof (Pyramid / Cone)
      const roofMat = new THREE.MeshStandardMaterial({
        color: isPoor ? 0x78350f : 0x059669,
        roughness: 0.5,
      });
      const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 4), roofMat);
      roofMesh.position.y = 2.4;
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      houseGroup.add(roofMesh);

      // Farming Plot (Crops next to the house)
      const cropColor =
        climateShock.intensity > 0.6
          ? 0x713f12 // Withered brown crops
          : climateShock.intensity > 0.3
          ? 0xa16207 // Stressed yellow crops
          : 0x16a34a; // Healthy lush green

      const cropMat = new THREE.MeshStandardMaterial({ color: cropColor, roughness: 0.9 });
      for (let cx = -1.5; cx <= 1.5; cx += 0.8) {
        for (let cz = 2.2; cz <= 4.2; cz += 0.8) {
          const cropHeight = Math.max(0.2, 0.8 * (climateShock.cropYieldImpactFactor || 1.0));
          const cropMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.2, cropHeight, 5),
            cropMat
          );
          cropMesh.position.set(cx, cropHeight / 2, cz);
          cropMesh.castShadow = true;
          houseGroup.add(cropMesh);
        }
      }

      // Livestock (Little white/brown cubes for sheep/cows)
      if (state.capitals.natural.livestockUnits > 0) {
        const livestockMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.9), livestockMat);
        cow.position.set(-2.5, 0.25, 1.2);
        cow.castShadow = true;
        houseGroup.add(cow);
      }

      // Tag userData as required by specification
      houseGroup.userData = {
        twinId: twin.id,
        stateType: state.stateType,
        isPoor,
        income: state.monthlyTotalIncomeUSD,
      };

      wallMesh.userData = houseGroup.userData;
      roofMesh.userData = houseGroup.userData;

      interactiveObjects.push(wallMesh);
      interactiveObjects.push(roofMesh);
      twinMeshesGroup.add(houseGroup);
    });

    // Rain Particles when Heavy Rainfall is selected
    let rainParticles: THREE.Points | null = null;
    if (climateShock.shockType === 'HEAVY_RAINFALL' && climateShock.intensity > 0.2) {
      const rainCount = 1200;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = (Math.random() - 0.5) * 60;
        rainPos[i + 1] = Math.random() * 40;
        rainPos[i + 2] = (Math.random() - 0.5) * 60;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.15,
        transparent: true,
        opacity: 0.75,
      });
      rainParticles = new THREE.Points(rainGeo, rainMat);
      scene.add(rainParticles);
    }

    // Raycasting for Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.twinId) {
          setSelectedTwinId(hit.userData.twinId);
          onSelectTwin(hit.userData.twinId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle slow camera orbital pan
      angle += 0.0015;
      if (cameraView === 'ISOMETRIC') {
        camera.position.x = 42 * Math.cos(angle);
        camera.position.z = 42 * Math.sin(angle);
        camera.position.y = 28;
        camera.lookAt(0, 0, 0);
      } else if (cameraView === 'TOP_DOWN') {
        camera.position.set(0, 50, 0.1);
        camera.lookAt(0, 0, 0);
      }

      // Rain animation
      if (rainParticles) {
        const p = rainParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 1; i < p.count * 3; i += 3) {
          p.array[i] -= 0.6;
          if (p.array[i] < 0) {
            p.array[i] = 40;
          }
        }
        p.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [twins, country, activeScenario, climateShock, cameraView]);

  return (
    <div className="space-y-5 pb-12">
      {/* 3D Scene Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Entorno 3D del Gemelo Digital Rural (Three.js)
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Vínculo Bidireccional
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Paisaje agroecológico con hogares modelados en 3D, cultivos reactivos al estrés hídrico y simulación climática en tiempo real.
          </p>
        </div>

        {/* Camera Views */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
          <span className="text-[11px] text-slate-400 px-1">Cámara:</span>
          <button
            id="btn-cam-iso"
            onClick={() => setCameraView('ISOMETRIC')}
            className={`px-2 py-1 rounded font-medium transition-all ${
              cameraView === 'ISOMETRIC' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Orbital
          </button>
          <button
            id="btn-cam-top"
            onClick={() => setCameraView('TOP_DOWN')}
            className={`px-2 py-1 rounded font-medium transition-all ${
              cameraView === 'TOP_DOWN' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Cenital
          </button>
        </div>
      </div>

      {/* 3D Stage + Floating Climate Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl min-h-[500px]">
          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="w-full h-[520px]" />

          {/* Interactive Hint */}
          <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 backdrop-blur-xs flex items-center gap-2 pointer-events-none">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Haz clic sobre cualquier vivienda para inspeccionar su Digital Twin</span>
          </div>

          {/* Live Climate Banner inside 3D */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${climateShock.intensity > 0.5 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {climateShock.shockType === 'HEAVY_RAINFALL' ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-semibold text-white">
                  Estrés Agroclimático: <span className="font-mono text-emerald-400">{shockType}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Rendimiento Cosecha: <span className="text-rose-400 font-mono">{(climateShock.cropYieldImpactFactor * 100).toFixed(0)}%</span> &bull; Anomalía Precipitación: <span className="text-slate-200 font-mono">{climateShock.rainfallAnomalyPct}%</span>
                </div>
              </div>
            </div>

            {/* Quick Shock Selectors */}
            <div className="flex items-center gap-2">
              <button
                id="btn-shock-normal"
                onClick={() => {
                  setShockType('NORMAL');
                  handleSliderChange(0);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
              >
                Normal
              </button>
              <button
                id="btn-shock-drought"
                onClick={() => {
                  setShockType('DROUGHT');
                  handleSliderChange(0.7);
                }}
                className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 text-[11px]"
              >
                Sequía 70%
              </button>
              <button
                id="btn-shock-rain"
                onClick={() => {
                  setShockType('HEAVY_RAINFALL');
                  handleSliderChange(0.8);
                }}
                className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[11px]"
              >
                Lluvias Torrenciales
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Twin Inspector & Climate Slider */}
        <div className="space-y-5">
          {/* Climate Controller Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" /> Control de Choque Climático
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Intensidad del Choque:</span>
                <span className="font-mono font-bold text-emerald-400">{Math.round(droughtSlider * 100)}%</span>
              </div>
              <input
                id="slider-climate-intensity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={droughtSlider}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Línea Base)</span>
                <span>100% (Extremo)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              Al deslizar, el color y altura de los cultivos en el lienzo 3D se adaptan inmediatamente junto con el recálculo en cascada de ingresos agrícolas.
            </div>
          </div>

          {/* Selected Twin Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-white text-sm">Hogar Seleccionado en 3D</h3>

            {selectedTwin && selectedHH ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ID Gemelo:</span>
                  <span className="font-mono font-bold text-white">{selectedTwin.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Código Anonimizado:</span>
                  <span className="font-mono text-emerald-400">{selectedHH.anonymousCode}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Ingreso Mensual:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ${selectedTwin.observedState.monthlyTotalIncomeUSD} USD
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Pobreza FGT₀:</span>
                  <span className={selectedTwin.observedState.isPovertyFGT0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {selectedTwin.observedState.isPovertyFGT0 ? 'Bajo Línea' : 'No Pobre'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Resiliencia (DFID):</span>
                  <span className="font-mono text-teal-400">{selectedTwin.observedState.resilienceScore}</span>
                </div>

                <button
                  id="btn-inspect-selected-twin"
                  onClick={() => onSelectTwin(selectedTwin.id)}
                  className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Abrir Ficha Completa
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-4 text-center">
                Haz clic en una vivienda de la escena 3D para ver sus activos y vulnerabilidad.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
