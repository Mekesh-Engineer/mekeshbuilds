/**
 * HeroCanvas.tsx
 * ─────────────────────────────────────────────
 * React Three Fiber 3D scene for the hero section.
 * Lazy-loaded — zero cost until JS hydrates.
 *
 * Layers (back → front):
 *  z=-4  DepthFog        – transparent gradient plane
 *  z=-3  GridPlane       – subtle perspective grid
 *  z=-2  AbstractShapes  – geometric accent shapes (appear on portrait hover)
 *  z=-1  FloatingDots    – particle cloud
 *  z= 0  EnergyRings     – concentric glowing torus rings
 *
 * Dependencies: @react-three/fiber  @react-three/drei  three
 */

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import heroImg from '../../assets/images/hero.png';
import hero1Img from '../../assets/images/hero1.png';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SceneProps {
    /** Normalised mouse position [-1, 1] from parent */
    mouseNorm: { x: number; y: number };
    /** Whether the portrait area is being hovered */
    portraitHovered: boolean;
    portraitRect: { width: number; height: number; left: number; top: number };
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT_COLOR = new THREE.Color('#ff6b2c');
const ACCENT_DIM = new THREE.Color('#7a2e00');
const PURPLE_COLOR = new THREE.Color('#6b2cff');
const HOLO_COLOR = new THREE.Color('#a78bff');

// ─── Utility ───────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

// ─── Data Stream Particles ────────────────────────────────────────────────────
function DataStreamParticles({ active }: { active: boolean }) {
    const ref = useRef<THREE.Points>(null!);
    const count = 180;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 6 + Math.random() * 4;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 2] = Math.sin(angle) * radius - 1;
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime();
        const pos = ref.current.geometry.attributes.position!.array as Float32Array;

        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] = pos[i * 3 + 1]! + Math.sin(t * 2 + i) * 0.008;
        }
        ref.current.geometry.attributes.position!.needsUpdate = true;
        ref.current.rotation.y = t * 0.03;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={HOLO_COLOR}
                size={0.035}
                sizeAttenuation
                depthWrite={false}
                opacity={active ? 0.75 : 0.25}
            />
        </Points>
    );
}

// ─── Floating Dot Particles ───────────────────────────────────────────────────
function FloatingDots({ count = 280 }: { count?: number }) {
    const ref = useRef<THREE.Points>(null!);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Distribute in a wide disc, slightly varied depth
            const r = Math.sqrt(Math.random()) * 9;
            const theta = Math.random() * Math.PI * 2;
            pos[i * 3 + 0] = Math.cos(theta) * r;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
            pos[i * 3 + 2] = Math.sin(theta) * 2 - 1.5; // z range [-3.5, 0.5]
        }
        return pos;
    }, [count]);

    // Per-particle speeds for organic drift
    const speeds = useMemo(
        () => Array.from({ length: count }, () => ({
            freq: 0.1 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
            amp: 0.04 + Math.random() * 0.10,
        })),
        [count],
    );

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const pos = ref.current.geometry.attributes.position!.array as Float32Array;
        const t = clock.getElapsedTime();
        for (let i = 0; i < count; i++) {
            const speed = speeds[i]!;
            pos[i * 3 + 1] = pos[i * 3 + 1]! + Math.sin(t * speed.freq + speed.phase) * speed.amp * 0.01;
        }
        ref.current.geometry.attributes.position!.needsUpdate = true;
        ref.current.rotation.y = t * 0.008;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={ACCENT_COLOR}
                size={0.028}
                sizeAttenuation
                depthWrite={false}
                opacity={0.55}
            />
        </Points>
    );
}

// ─── Grid / Depth Plane ───────────────────────────────────────────────────────
function GridPlane() {
    const matRef = useRef<THREE.ShaderMaterial>(null!);

    const shader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: ACCENT_DIM },
            uFade: { value: 1 },
        },
        vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3  uColor;
      uniform float uFade;
      varying vec2  vUv;

      float grid(vec2 uv, float res) {
        vec2 g = abs(fract(uv * res - 0.5) - 0.5) / fwidth(uv * res);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }

      void main() {
        float g   = grid(vUv, 12.0) * 0.35;
        // Radial fade so edges are invisible
        float r   = length(vUv - 0.5) * 2.0;
        float mask = 1.0 - smoothstep(0.55, 1.0, r);
        // Subtle scan-line pulse
        float scan = sin(vUv.y * 60.0 + uTime * 0.4) * 0.03 + 0.97;
        float alpha = g * mask * scan * uFade;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
        transparent: true,
        depthWrite: false,
    }), []);

    useFrame(({ clock }) => {
        if (matRef.current && matRef.current.uniforms.uTime) {
            matRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh position={[0, -1.5, -3]} rotation={[-Math.PI / 2.6, 0, 0]}>
            <planeGeometry args={[22, 22, 1, 1]} />
            <shaderMaterial ref={matRef} {...shader} />
        </mesh>
    );
}

// ─── Concentric Energy Rings ──────────────────────────────────────────────────
function EnergyRings({ active }: { active: boolean }) {
    const group = useRef<THREE.Group>(null!);
    const rings = useMemo(() =>
        Array.from({ length: 4 }, (_, i) => ({
            radius: 1.0 + i * 0.55,
            tube: 0.006 + i * 0.003,
            speed: 0.3 + i * 0.08,
            phase: i * (Math.PI / 2),
            opacity: 0.55 - i * 0.10,
        })), []);

    const targetOpacity = useRef(0);
    const currentOpacity = useRef(0);
    const meshRefs = useRef<THREE.Mesh[]>([]);

    useEffect(() => {
        targetOpacity.current = active ? 1.35 : 0.65;
    }, [active]);

    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.getElapsedTime();

        // Smooth opacity blend in/out
        currentOpacity.current = lerp(currentOpacity.current, targetOpacity.current, 0.08);

        group.current.rotation.x = t * 0.12;
        group.current.rotation.z = t * 0.08;

        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            const ring = rings[i]!;
            mat.opacity = ring.opacity * currentOpacity.current;
            mesh.rotation.y = t * ring.speed + ring.phase;
        });
    });

    return (
        <group ref={group} position={[0, 0.2, -0.5]}>
            {rings.map((r, i) => (
                <mesh
                    key={i}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                >
                    <torusGeometry args={[r.radius, r.tube, 16, 120]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? ACCENT_COLOR : PURPLE_COLOR}
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Abstract Geometric Shapes ────────────────────────────────────────────────
function AbstractShapes({ active }: { active: boolean }) {
    const group = useRef<THREE.Group>(null!);
    const targetScale = useRef(0);
    const currentScale = useRef(0);

    const shapes = useMemo(() => [
        { pos: [-2.2, 0.8, -1.5] as [number, number, number], rot: [0.5, 0.3, 0.2] as [number, number, number], geo: 'oct', color: ACCENT_COLOR, speed: 0.4 },
        { pos: [2.4, 0.4, -1.8] as [number, number, number], rot: [0.2, 0.7, 0.1] as [number, number, number], geo: 'tet', color: PURPLE_COLOR, speed: 0.35 },
        { pos: [-1.6, -1.2, -2.0] as [number, number, number], rot: [0.1, 0.4, 0.6] as [number, number, number], geo: 'box', color: ACCENT_COLOR, speed: 0.28 },
        { pos: [1.8, -0.8, -1.6] as [number, number, number], rot: [0.6, 0.2, 0.3] as [number, number, number], geo: 'ico', color: PURPLE_COLOR, speed: 0.45 },
        { pos: [0.0, 2.2, -2.2] as [number, number, number], rot: [0.3, 0.5, 0.4] as [number, number, number], geo: 'oct', color: ACCENT_DIM, speed: 0.30 },
    ], []);

    useEffect(() => {
        targetScale.current = active ? 1.15 : 0.95;
    }, [active]);

    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.getElapsedTime();

        // Smooth scale in/out
        currentScale.current = lerp(currentScale.current, targetScale.current, 0.06);
        group.current.scale.setScalar(currentScale.current);

        // Rotate each child
        group.current.children.forEach((child, i) => {
            const shape = shapes[i]!;
            child.rotation.x += shape.speed * 0.004;
            child.rotation.y += shape.speed * 0.006;
            // Gentle float
            (child as THREE.Mesh).position.y = shape.pos[1] + Math.sin(t * 0.6 + i) * 0.06;
        });
    });

    function makeGeo(type: string) {
        switch (type) {
            case 'oct': return <octahedronGeometry args={[0.22]} />;
            case 'tet': return <tetrahedronGeometry args={[0.26]} />;
            case 'box': return <boxGeometry args={[0.22, 0.22, 0.22]} />;
            case 'ico': return <icosahedronGeometry args={[0.20, 0]} />;
            default: return <octahedronGeometry args={[0.22]} />;
        }
    }

    return (
        <group ref={group}>
            {shapes.map((s, i) => (
                <mesh key={i} position={s.pos} rotation={s.rot}>
                    {makeGeo(s.geo)}
                    <meshStandardMaterial
                        color={s.color}
                        emissive={s.color}
                        emissiveIntensity={active ? 0.75 : 0.4}
                        wireframe
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Glowing Line Streaks ─────────────────────────────────────────────────────
function GlowStreaks({ active }: { active: boolean }) {
    const group = useRef<THREE.Group>(null!);
    const targetOpacity = useRef(0);
    const currentOpacity = useRef(0);
    const meshRefs = useRef<THREE.Mesh[]>([]);

    const streaks = useMemo(() => Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return {
            pos: [Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, -0.8] as [number, number, number],
            rot: [0, 0, angle] as [number, number, number],
            len: 0.5 + Math.random() * 0.6,
        };
    }), []);

    useEffect(() => {
        targetOpacity.current = active ? 1 : 0;
    }, [active]);

    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.getElapsedTime();
        currentOpacity.current = lerp(currentOpacity.current, targetOpacity.current, 0.07);

        meshRefs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            // Pulse each streak with offset phase
            const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 0.8);
            mat.opacity = pulse * 0.65 * currentOpacity.current;
            mesh.scale.y = 0.6 + pulse * 0.4;
        });
    });

    return (
        <group ref={group}>
            {streaks.map((s, i) => (
                <mesh
                    key={i}
                    position={s.pos}
                    rotation={s.rot}
                    ref={(el) => { if (el) meshRefs.current[i] = el; }}
                >
                    <planeGeometry args={[0.01, s.len]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? ACCENT_COLOR : PURPLE_COLOR}
                        transparent
                        opacity={0}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Camera Parallax Controller ───────────────────────────────────────────────
function CameraController({ mouseNorm }: { mouseNorm: { x: number; y: number } }) {
    const { camera } = useThree();
    const targetX = useRef(0);
    const targetY = useRef(0);

    useFrame(() => {
        targetX.current = lerp(targetX.current, mouseNorm.x * 0.35, 0.05);
        targetY.current = lerp(targetY.current, mouseNorm.y * 0.20, 0.05);
        camera.position.x = lerp(camera.position.x, targetX.current, 0.08);
        camera.position.y = lerp(camera.position.y, targetY.current, 0.08);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// ─── Ambient Volume Light ─────────────────────────────────────────────────────
function SceneLights({ active }: { active: boolean }) {
    const pointRef = useRef<THREE.PointLight>(null!);
    const targetIntensity = useRef(0.6);

    useEffect(() => {
        targetIntensity.current = active ? 2.4 : 0.6;
    }, [active]);

    useFrame(() => {
        if (!pointRef.current) return;
        pointRef.current.intensity = lerp(
            pointRef.current.intensity,
            targetIntensity.current,
            0.06,
        );
    });

    return (
        <>
            <ambientLight intensity={0.25} />
            <pointLight ref={pointRef} position={[0, 2, 2]} color={ACCENT_COLOR} intensity={0.6} distance={10} />
            <pointLight position={[-3, -1, 1]} color={PURPLE_COLOR} intensity={0.3} distance={8} />
        </>
    );
}

// ─── Fluid Morph Portrait (Hover Transition) ──────────────────────────────────
function MorphPortrait({ active, portraitRect }: { active: boolean, portraitRect: SceneProps['portraitRect'] }) {
    // Load both textures
    const [tex1, tex2] = useTexture([heroImg, hero1Img]);
    const { viewport, size } = useThree();
    const meshRef = useRef<THREE.Mesh>(null!);
    const matRef = useRef<THREE.ShaderMaterial>(null!);
    const currentProgress = useRef(0);

    const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 64, 64), []);

    useFrame((_, delta) => {
        if (!matRef.current || !matRef.current.uniforms) return;
        // Smoothly approach 1 when hovered (hero1), 0 when idle (hero)
        // Adjust damp factor for fluidity (lower = smoother/slower)
        currentProgress.current = THREE.MathUtils.damp(currentProgress.current, active ? 1 : 0, 4.5, delta);
        if (matRef.current.uniforms.uProgress) {
            matRef.current.uniforms.uProgress.value = currentProgress.current;
        }
    });

    const uniforms = useMemo(() => ({
        tex1: { value: tex1 },
        tex2: { value: tex2 },
        uProgress: { value: 0 },
        aspect1: { value: 1.0 },
        aspect2: { value: 1.0 },
        aspectBox: { value: 1.0 }
    }), [tex1, tex2]);

    const vertexShader = `
      varying vec2 vUv;
      uniform float uProgress;
      void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Subtly bulge the mesh forward during the transition to add immersive 3D volume
          float dist = distance(uv, vec2(0.5));
          float bulge = sin(uProgress * 3.1415) * 0.08 * (1.0 - smoothstep(0.1, 0.7, dist));
          pos.z += bulge;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D tex1;
      uniform sampler2D tex2;
      uniform float uProgress;
      uniform float aspect1;
      uniform float aspect2;
      uniform float aspectBox;
      varying vec2 vUv;

      vec2 getCoverUV(vec2 uv, float texAspect, float boxA) {
          vec2 newUv = uv;
          // Cover fit keeps both portraits filling the exact same frame size.
          if (texAspect > boxA) {
              float scaleX = boxA / texAspect;
              newUv.x = (uv.x - 0.5) * scaleX + 0.5;
          } else {
              float scaleY = texAspect / boxA;
              newUv.y = (uv.y - 0.5) * scaleY + 0.5;
          }
          return newUv;
      }

      void main() {
          vec2 uv1 = getCoverUV(vUv, aspect1, aspectBox);
          vec2 uv2 = getCoverUV(vUv, aspect2, aspectBox);
          
          float mask1 = step(0.0, uv1.x) * step(uv1.x, 1.0) * step(0.0, uv1.y) * step(uv1.y, 1.0);
          float mask2 = step(0.0, uv2.x) * step(uv2.x, 1.0) * step(0.0, uv2.y) * step(uv2.y, 1.0);

          float effect = sin(uProgress * 3.1415);
          
          float wave1 = sin(vUv.y * 15.0) * 0.04 * effect;
          float wave2 = sin(vUv.y * 15.0 + 3.1415) * 0.04 * effect;
          
          vec4 c1 = texture2D(tex1, clamp(uv1 + vec2(wave1, 0.0), 0.0, 1.0)) * mask1;
          vec4 c2 = texture2D(tex2, clamp(uv2 + vec2(wave2, 0.0), 0.0, 1.0)) * mask2;
          
          vec3 auraColor = vec3(1.0, 0.4, 0.1); 
          float glowMask = max(c1.a, c2.a);
          vec3 glow = glowMask * auraColor * effect * 0.35;
          
          vec4 finalColor = mix(c1, c2, smoothstep(0.0, 1.0, uProgress));
          finalColor.rgb += glow;
          
          float rim = 1.0 - dot(normalize(vUv - 0.5), vec2(0.0, 1.0));
          // HOLO_COLOR approx vec3(0.655, 0.545, 1.0)
          vec3 holographicRim = vec3(0.655, 0.545, 1.0) * pow(rim, 3.0) * 1.8 * effect;
          finalColor.rgb += holographicRim;
          
          if (finalColor.a < 0.03) discard;
          
          gl_FragColor = finalColor;
      }
    `;

    if (!tex1 || !tex2 || !portraitRect.width || !portraitRect.height) return null;

    const boxW = (portraitRect.width / size.width) * viewport.width;
    const boxH = (portraitRect.height / size.height) * viewport.height;

    // Fallback if image isn't fully ready
    const img1 = tex1.image as HTMLImageElement;
    const img2 = tex2.image as HTMLImageElement;
    if (!img1 || !img1.width || !img2 || !img2.width) return null;

    const aspectImg1 = img1.width / img1.height;
    const aspectImg2 = img2.width / img2.height;
    const aspectBox = portraitRect.width / portraitRect.height;

    // Dynamically update the uniforms with the calculated aspects
    uniforms.aspect1.value = aspectImg1;
    uniforms.aspect2.value = aspectImg2;
    uniforms.aspectBox.value = aspectBox;

    // Position maps perfectly to the entire bounding box
    const xBase = (portraitRect.left / size.width) * viewport.width - viewport.width / 2 + boxW / 2;
    const boxTopFromCenter = -(portraitRect.top / size.height) * viewport.height + viewport.height / 2;
    const boxBottomFromCenter = boxTopFromCenter - boxH;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            position={[xBase, boxBottomFromCenter + boxH / 2, 0.5]}
            scale={[boxW, boxH, 1]}
            frustumCulled={false}
            renderOrder={100}
        >
            <shaderMaterial
                ref={matRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ mouseNorm, portraitHovered, portraitRect }: SceneProps) {
    return (
        <>
            <CameraController mouseNorm={mouseNorm} />
            <SceneLights active={portraitHovered} />
            <GridPlane />
            <FloatingDots count={260} />
            <DataStreamParticles active={portraitHovered} />
            <EnergyRings active={portraitHovered} />
            <AbstractShapes active={portraitHovered} />
            <GlowStreaks active={portraitHovered} />
            <MorphPortrait active={portraitHovered} portraitRect={portraitRect} />
        </>
    );
}

// ─── Exported Canvas Wrapper ──────────────────────────────────────────────────
export interface HeroCanvasProps {
    mouseNorm: { x: number; y: number };
    portraitHovered: boolean;
    portraitRect?: { width: number; height: number; left: number; top: number };
    /** Reduced motion / low-end device fallback */
    disabled?: boolean;
}

export default function HeroCanvas({ mouseNorm, portraitHovered, disabled = false, portraitRect = { width: 0, height: 0, left: 0, top: 0 } }: HeroCanvasProps) {
    if (disabled) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5]"
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 52 }}
                gl={{
                    antialias: false,         // off for perf
                    alpha: true,              // transparent background
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                dpr={[1, 1.5]}              // cap pixel ratio for mobile
                style={{ background: 'transparent' }}
                flat                        // no tone-mapping overhead
            >
                <Scene mouseNorm={mouseNorm} portraitHovered={portraitHovered} portraitRect={portraitRect} />
            </Canvas>
        </div>
    );
}