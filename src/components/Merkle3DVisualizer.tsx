"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SwarmMerkleNode, SwarmExecutionBundle } from "@/lib/types";
import { GitCommit, ShieldCheck, CheckCircle2, RefreshCw } from "@/components/Icons";

interface Merkle3DVisualizerProps {
  bundle?: SwarmExecutionBundle;
  onSelectNode?: (node: SwarmMerkleNode) => void;
  className?: string;
}

export const Merkle3DVisualizer: React.FC<Merkle3DVisualizerProps> = ({
  bundle,
  onSelectNode,
  className = "",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SwarmMerkleNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SwarmMerkleNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !bundle || !bundle.merkleTree) return;

    let isVisible = true;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b11, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x14b8a6, 3, 30);
    pointLight.position.set(0, 6, 0);
    scene.add(pointLight);

    // 4. Build 3D Merkle Tree Nodes in Tiered Cylindrical Layout
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    interface Flat3DNode {
      node: SwarmMerkleNode;
      mesh: THREE.Mesh;
      position: THREE.Vector3;
      depth: number;
      parentPos?: THREE.Vector3;
    }

    const flatNodes: Flat3DNode[] = [];
    const connectionLines: THREE.Line[] = [];

    // Traverse Merkle Tree recursively
    const processTreeLevel = (
      node: SwarmMerkleNode,
      depth = 0,
      angle = 0,
      totalSiblings = 1,
      parentPosition?: THREE.Vector3
    ) => {
      const y = 5.5 - depth * 3.5;
      const radius = depth === 0 ? 0 : depth * 3.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, y, z);

      const isRoot = node.type === "root";
      const isLeaf = node.type === "leaf";

      // Node Geometry & Material
      const size = isRoot ? 1.2 : isLeaf ? 0.75 : 0.9;
      const geo = isRoot
        ? new THREE.OctahedronGeometry(size, 0)
        : new THREE.IcosahedronGeometry(size, 1);

      const colorHex = isRoot ? 0x14b8a6 : isLeaf ? 0x06b6d4 : 0x10b981;
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0e1420,
        emissive: colorHex,
        emissiveIntensity: isRoot ? 0.9 : 0.55,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      mesh.userData = { node };
      treeGroup.add(mesh);

      // Connect line to parent
      if (parentPosition) {
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x14b8a6,
          transparent: true,
          opacity: 0.35,
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([parentPosition, position]);
        const line = new THREE.Line(lineGeo, lineMat);
        treeGroup.add(line);
        connectionLines.push(line);
      }

      flatNodes.push({ node, mesh, position, depth, parentPos: parentPosition });

      if (node.children && node.children.length > 0) {
        node.children.forEach((child, idx) => {
          const childAngle = angle + ((idx - (node.children!.length - 1) / 2) * (Math.PI / 3.5));
          processTreeLevel(child, depth + 1, childAngle, node.children!.length, position);
        });
      }
    };

    processTreeLevel(bundle.merkleTree.treeStructure);

    // 5. Ambient Particles
    const particlesCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 35;
      posArray[i + 1] = (Math.random() - 0.5) * 25;
      posArray[i + 2] = (Math.random() - 0.5) * 35;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.15, color: 0x14b8a6, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Drag & Raycasting
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;
    let rotX = 0.25;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        rotY += deltaX * 0.005;
        rotX = Math.max(-0.4, Math.min(0.7, rotX + deltaY * 0.005));
        prevMouse = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(flatNodes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.node as SwarmMerkleNode;
        setHoveredNode(hit);
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = "pointer";
      } else {
        setHoveredNode(null);
        setHoverPos(null);
        container.style.cursor = isDragging ? "grabbing" : "grab";
      }
    };

    const onClick = () => {
      if (hoveredNode) {
        setSelectedNode(hoveredNode);
        if (onSelectNode) onSelectNode(hoveredNode);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);

    // 7. Observer
    const observer = new IntersectionObserver(([e]) => {
      isVisible = e.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    // 8. Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      if (!isDragging && autoOrbit) {
        rotY += 0.0025;
      }

      const radius = 22;
      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * radius;
      camera.position.y = Math.sin(rotX) * radius + 5;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * radius;
      camera.lookAt(0, 1, 0);

      // Rotate nodes on own axes
      flatNodes.forEach((item, idx) => {
        item.mesh.rotation.y = elapsed * 0.5 + idx;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Teardown
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
      renderer.dispose();
    };
  }, [bundle, autoOrbit, onSelectNode, hoveredNode]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-[#080b11] shadow-xl ${className}`}>
      <div ref={mountRef} className="w-full h-[360px] sm:h-[420px] cursor-grab active:cursor-grabbing" />

      {/* Controls Overlay */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-teal-500/30 text-teal-400 text-xs font-mono font-bold flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>3D Holographic Merkle Tree Vault</span>
        </div>

        <button
          onClick={() => setAutoOrbit(!autoOrbit)}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium backdrop-blur-md border transition-all cursor-pointer pointer-events-auto ${
            autoOrbit
              ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
              : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          {autoOrbit ? "Auto-Orbit: ON" : "Auto-Orbit: OFF"}
        </button>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredNode && hoverPos && (
        <div
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 p-3 rounded-xl bg-slate-950/95 border border-teal-500/60 shadow-2xl backdrop-blur-xl text-xs font-mono space-y-1 min-w-[220px]"
          style={{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px` }}
        >
          <div className="font-bold text-slate-100 flex items-center gap-1.5 border-b border-white/[0.08] pb-1">
            <GitCommit className="w-3.5 h-3.5 text-teal-400" />
            <span>{hoveredNode.label}</span>
          </div>
          {hoveredNode.dataSummary && (
            <div className="text-[11px] text-slate-300 font-sans">{hoveredNode.dataSummary}</div>
          )}
          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
            {hoveredNode.hash}
          </div>
        </div>
      )}
    </div>
  );
};
