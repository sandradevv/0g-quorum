"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SwarmAgent, BFTConsensusState, AgentRole } from "@/lib/types";
import { Shield, Cpu, CheckCircle2, Scale, Zap, Activity } from "@/components/Icons";

interface Swarm3DCanvasProps {
  agents: SwarmAgent[];
  consensusState?: BFTConsensusState;
  isDeliberating?: boolean;
  className?: string;
}

type CameraFocusTarget = "ALL" | "CORE" | "SENTINEL" | "ROUTER" | "GUARD" | "ARBITER";

export const Swarm3DCanvas: React.FC<Swarm3DCanvasProps> = ({
  agents,
  consensusState,
  isDeliberating = false,
  className = "",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredAgent, setHoveredAgent] = useState<SwarmAgent | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [focusTarget, setFocusTarget] = useState<CameraFocusTarget>("ALL");

  const byzantineActive = consensusState?.byzantineFaultDetected ?? false;
  const isolatedAgents = consensusState?.isolatedAgents ?? [];

  // Live mutable state ref
  const stateRef = useRef({
    isDeliberating,
    byzantineActive,
    isolatedAgents,
    autoRotate,
    focusTarget,
    agents,
  });

  useEffect(() => {
    stateRef.current = {
      isDeliberating,
      byzantineActive,
      isolatedAgents,
      autoRotate,
      focusTarget,
      agents,
    };
  }, [isDeliberating, byzantineActive, isolatedAgents, autoRotate, focusTarget, agents]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isVisible = true;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b11, 0.035);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 8, 24);
    camera.lookAt(0, 0, 0);

    const targetCameraPos = new THREE.Vector3(0, 8, 24);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLightCore = new THREE.PointLight(0x14b8a6, 4, 35);
    pointLightCore.position.set(0, 1, 0);
    scene.add(pointLightCore);

    const pointLightTop = new THREE.PointLight(0x06b6d4, 2.5, 45);
    pointLightTop.position.set(0, 18, 12);
    scene.add(pointLightTop);

    // 5. Central 0G Consensus Core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0e1420,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    const wireGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // Orbital Rings
    const ring1Geo = new THREE.RingGeometry(8.4, 8.48, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 2;
    scene.add(ring1Mesh);

    const ring2Geo = new THREE.RingGeometry(9.6, 9.68, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2.2;
    ring2Mesh.rotation.y = Math.PI / 8;
    scene.add(ring2Mesh);

    // 6. Background Starfield / Reasoning Token Dust
    const particlesCount = 240;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const tealCol = new THREE.Color(0x14b8a6);
    const cyanCol = new THREE.Color(0x06b6d4);
    const emeraldCol = new THREE.Color(0x10b981);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45;
      particlePositions[i + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i + 2] = (Math.random() - 0.5) * 45;

      const pick = Math.random();
      const col = pick > 0.6 ? cyanCol : pick > 0.3 ? tealCol : emeraldCol;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. 4 Agent Nodes & Forcefield Bubbles
    const agentRadius = 8.6;
    const roleColorMap: Record<AgentRole, number> = {
      SENTINEL: 0xf43f5e,
      ROUTER: 0x06b6d4,
      GUARD: 0x10b981,
      ARBITER: 0xa855f7,
    };

    const agentMeshes: {
      group: THREE.Group;
      nodeMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      shieldMesh: THREE.Mesh;
      line: THREE.Line;
      agent: SwarmAgent;
      pos: THREE.Vector3;
      angle: number;
    }[] = [];

    agents.forEach((agent, index) => {
      const angle = (index / Math.max(agents.length, 1)) * Math.PI * 2;
      const colorHex = roleColorMap[agent.role] || 0x14b8a6;
      const x = Math.cos(angle) * agentRadius;
      const z = Math.sin(angle) * agentRadius;
      const pos = new THREE.Vector3(x, 0, z);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);

      // Core Agent Sphere
      const agentGeo = new THREE.SphereGeometry(1.0, 32, 32);
      const agentMat = new THREE.MeshStandardMaterial({
        color: 0x0a0f18,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.15,
        metalness: 0.85,
      });
      const nodeMesh = new THREE.Mesh(agentGeo, agentMat);
      nodeMesh.userData = { agent };
      nodeGroup.add(nodeMesh);

      // Halo Ring
      const haloGeo = new THREE.TorusGeometry(1.35, 0.04, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.45,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(haloMesh);

      // Quarantine Shield Bubble (Visible when isolated)
      const shieldGeo = new THREE.SphereGeometry(1.7, 24, 24);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.6,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
      });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      nodeGroup.add(shieldMesh);

      scene.add(nodeGroup);

      // Core Line
      const coreLineMat = new THREE.LineBasicMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.4,
      });
      const coreLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        nodeGroup.position,
      ]);
      const line = new THREE.Line(coreLineGeo, coreLineMat);
      scene.add(line);

      agentMeshes.push({
        group: nodeGroup,
        nodeMesh,
        haloMesh,
        shieldMesh,
        line,
        agent,
        pos,
        angle,
      });
    });

    // 8. Dynamic Token Calldata Packets (Animated Particle Pulses)
    const tokenPacketsCount = 8;
    const tokenGeos: { mesh: THREE.Mesh; progress: number; speed: number; startIdx: number; endIdx: number }[] = [];
    const packetGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.9 });

    for (let p = 0; p < tokenPacketsCount; p++) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      scene.add(pMesh);
      tokenGeos.push({
        mesh: pMesh,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006,
        startIdx: p % agentMeshes.length,
        endIdx: (p + 1) % agentMeshes.length,
      });
    }

    // 9. Interactivity & Drag Control
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationAngleY = 0;
    let rotationAngleX = 0.2;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        rotationAngleY += deltaX * 0.004;
        rotationAngleX = Math.max(-0.5, Math.min(0.7, rotationAngleX + deltaY * 0.004));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Hover Detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(agentMeshes.map((a) => a.nodeMesh));

      if (intersects.length > 0) {
        const hitAgent = intersects[0].object.userData.agent as SwarmAgent;
        setHoveredAgent(hitAgent);
        setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = "pointer";
      } else {
        setHoveredAgent(null);
        setHoverPosition(null);
        container.style.cursor = isDragging ? "grabbing" : "grab";
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    const onMouseLeave = () => {
      isDragging = false;
      setHoveredAgent(null);
      setHoverPosition(null);
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseLeave);

    // 10. Intersection Observer (0% CPU when offscreen)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 11. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();
      const current = stateRef.current;

      // Camera Focus Modes & Smooth Lerp
      if (current.focusTarget === "ALL") {
        if (!isDragging && current.autoRotate) {
          rotationAngleY += current.isDeliberating ? 0.005 : 0.0018;
        }
        const radius = 24;
        targetCameraPos.set(
          Math.sin(rotationAngleY) * Math.cos(rotationAngleX) * radius,
          Math.sin(rotationAngleX) * radius + 5,
          Math.cos(rotationAngleY) * Math.cos(rotationAngleX) * radius
        );
        targetLookAt.set(0, 0, 0);
      } else if (current.focusTarget === "CORE") {
        targetCameraPos.set(0, 4, 9);
        targetLookAt.set(0, 0, 0);
      } else {
        // Find agent by role
        const targetMesh = agentMeshes.find((a) => a.agent.role === current.focusTarget);
        if (targetMesh) {
          const targetWorldPos = targetMesh.group.position;
          targetCameraPos.set(
            targetWorldPos.x * 1.5,
            targetWorldPos.y + 3.5,
            targetWorldPos.z * 1.5 + 4
          );
          targetLookAt.copy(targetWorldPos);
        }
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCameraPos, 0.06);
      currentLookAt.lerp(targetLookAt, 0.06);
      camera.lookAt(currentLookAt);

      // Core animation
      coreMesh.rotation.y = elapsedTime * 0.35;
      wireMesh.rotation.y = -elapsedTime * 0.25;

      const pulseScale = 1 + Math.sin(elapsedTime * 2.8) * (current.isDeliberating ? 0.07 : 0.025);
      coreGroup.scale.set(pulseScale, pulseScale, pulseScale);
      (coreMat as THREE.MeshStandardMaterial).emissiveIntensity = current.isDeliberating ? 0.85 : 0.45;

      // Rotate starfield
      particleSystem.rotation.y = elapsedTime * 0.012;

      // Update Agent Nodes & Quarantine Shields
      agentMeshes.forEach((item, idx) => {
        const isIsolated = current.isolatedAgents.includes(item.agent.id);
        const mat = item.nodeMesh.material as THREE.MeshStandardMaterial;
        const shieldMat = item.shieldMesh.material as THREE.MeshStandardMaterial;

        if (isIsolated) {
          mat.emissive.setHex(0xe11d48);
          mat.emissiveIntensity = 1.4;
          (item.haloMesh.material as THREE.MeshBasicMaterial).color.setHex(0xe11d48);
          (item.line.material as THREE.LineBasicMaterial).color.setHex(0xf43f5e);

          // Render pulsing quarantine shield bubble
          shieldMat.opacity = 0.35 + Math.sin(elapsedTime * 4) * 0.2;
          item.shieldMesh.rotation.y = elapsedTime * 2;
        } else {
          const origColor = roleColorMap[item.agent.role] || 0x14b8a6;
          mat.emissive.setHex(origColor);
          mat.emissiveIntensity = current.isDeliberating ? 0.9 : 0.5;
          (item.haloMesh.material as THREE.MeshBasicMaterial).color.setHex(origColor);
          (item.line.material as THREE.LineBasicMaterial).color.setHex(0x14b8a6);
          shieldMat.opacity = 0.0;
        }

        const bob = Math.sin(elapsedTime * 2 + idx) * 0.25;
        item.group.position.y = bob;
        item.haloMesh.rotation.z = elapsedTime * 1.2;
      });

      // Animate Calldata Token Pulses
      tokenGeos.forEach((token) => {
        token.progress += token.speed * (current.isDeliberating ? 2.2 : 1.0);
        if (token.progress >= 1.0) {
          token.progress = 0;
          token.startIdx = Math.floor(Math.random() * agentMeshes.length);
          token.endIdx = Math.floor(Math.random() * agentMeshes.length);
        }

        const start = agentMeshes[token.startIdx]?.group.position || new THREE.Vector3(0, 0, 0);
        const end = agentMeshes[token.endIdx]?.group.position || new THREE.Vector3(0, 0, 0);

        // Arc through the center
        const p1 = new THREE.Vector3(0, 0.8, 0);
        const t = token.progress;

        // Quadratic Bézier interpolation
        const currentPos = new THREE.Vector3()
          .addScaledVector(start, (1 - t) * (1 - t))
          .addScaledVector(p1, 2 * (1 - t) * t)
          .addScaledVector(end, t * t);

        token.mesh.position.copy(currentPos);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 13. Teardown
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", handleResize);

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
  }, [agents]);

  const getRoleIcon = (role: AgentRole) => {
    switch (role) {
      case "SENTINEL":
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      case "ROUTER":
        return <Cpu className="w-3.5 h-3.5 text-cyan-500" />;
      case "GUARD":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "ARBITER":
        return <Scale className="w-3.5 h-3.5 text-violet-500" />;
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-[#080b11] shadow-xl ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-[380px] sm:h-[450px] cursor-grab active:cursor-grabbing" />

      {/* Top HUD Controls & Camera Presets */}
      <div className="absolute top-3.5 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-teal-500/30 text-teal-400 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>3D TEE Swarm Mesh Visualizer</span>
          </div>

          {byzantineActive && (
            <div className="px-2.5 py-1 rounded-lg bg-rose-950/85 backdrop-blur-md border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Byzantine Fault Active</span>
            </div>
          )}
        </div>

        {/* Camera Preset Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/85 p-1 rounded-xl border border-white/[0.08] backdrop-blur-md text-xs font-mono">
          <button
            onClick={() => setFocusTarget("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "ALL"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Orbital Free
          </button>
          <button
            onClick={() => setFocusTarget("CORE")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "CORE"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            0G Core
          </button>
          <button
            onClick={() => setFocusTarget("SENTINEL")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "SENTINEL"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-400 hover:text-rose-200"
            }`}
          >
            Sentinel
          </button>
          <button
            onClick={() => setFocusTarget("ROUTER")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "ROUTER"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-cyan-400 hover:text-cyan-200"
            }`}
          >
            Router
          </button>
          <button
            onClick={() => setFocusTarget("GUARD")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "GUARD"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-400 hover:text-emerald-200"
            }`}
          >
            Guard
          </button>
          <button
            onClick={() => setFocusTarget("ARBITER")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              focusTarget === "ARBITER"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-violet-400 hover:text-violet-200"
            }`}
          >
            Arbiter
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Legend */}
      <div className="absolute bottom-3.5 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {agents.map((agent) => {
            const isIsolated = isolatedAgents.includes(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => setFocusTarget(agent.role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 backdrop-blur-md border transition-all cursor-pointer ${
                  isIsolated
                    ? "bg-rose-950/85 border-rose-500/60 text-rose-300 ring-1 ring-rose-500/40"
                    : focusTarget === agent.role
                    ? "bg-teal-500/20 border-teal-500/60 text-teal-300 ring-1 ring-teal-500/30"
                    : "bg-slate-900/85 border-white/[0.08] text-slate-300 hover:border-slate-600"
                }`}
              >
                {getRoleIcon(agent.role)}
                <span className="font-bold">{agent.name}</span>
                {isIsolated && (
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase ml-1">
                    [ISOLATED]
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-right pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium backdrop-blur-md border transition-all cursor-pointer ${
              autoRotate
                ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {autoRotate ? "Auto-Orbit: ON" : "Auto-Orbit: OFF"}
          </button>
          <span className="text-[11px] font-mono text-teal-400 bg-slate-900/85 px-2.5 py-1 rounded-lg border border-teal-500/30">
            0G Consensus Core &bull; Llama-3.1 TEE
          </span>
        </div>
      </div>

      {/* Dynamic Hover Raycast Tooltip */}
      {hoveredAgent && hoverPosition && (
        <div
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 p-3 rounded-xl bg-slate-950/95 border border-teal-500/60 shadow-2xl backdrop-blur-xl text-xs font-mono space-y-1.5 min-w-[200px]"
          style={{ left: `${hoverPosition.x}px`, top: `${hoverPosition.y}px` }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-1">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              {getRoleIcon(hoveredAgent.role)}
              {hoveredAgent.name}
            </span>
            <span className="text-[10px] text-teal-400 font-semibold">{hoveredAgent.role}</span>
          </div>
          <div className="text-[11px] text-slate-300 font-sans">{hoveredAgent.specialty}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Enclave:</span>
            <span className="text-teal-300 font-mono">{hoveredAgent.teeEnclaveId}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Reputation:</span>
            <span className="text-emerald-400 font-mono font-bold">{hoveredAgent.reputationScore}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};
