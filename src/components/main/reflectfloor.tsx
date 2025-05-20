import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      waterShaderMaterial: THREE.ShaderMaterial
    }
  }
}

const vertexShader = `
varying vec2 vUv;
varying float vElevation;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // 전체적인 웨이브 패턴
  float elevation = 
      sin(pos.x * 2.0 - uTime * 2.0) * 0.2 + // x축 방향 웨이브
      sin(pos.z * 2.0 - uTime * 1.5) * 0.2 + // z축 방향 웨이브
      sin((pos.x + pos.z) * 1.5 - uTime * 2.5) * 0.15; // 대각선 방향 웨이브
  
  // 노이즈같은 추가 디테일
  elevation += 
      sin(pos.x * 4.0 - uTime * 3.0) * 0.1 +
      sin(pos.z * 4.0 - uTime * 2.8) * 0.1;
  
  pos.y += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
       varying vec2 vUv;
        varying float vElevation;
        uniform vec3 uColor;
        uniform vec3 uColor2;
        uniform float uOpacity;
        uniform float uTime;

        // 랜덤 함수
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // Perlin 노이즈 함수
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            // 4개의 코너에서의 랜덤값
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            // Smoothstep을 사용한 보간
            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        // FBM (Fractal Brownian Motion) 노이즈 함수
        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            
            // 옥타브를 더할수록 더 디테일한 노이즈가 생성됩니다
            for(int i = 0; i < 5; i++) {
                value += amplitude * noise(st * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }
      
        // CRT 왜곡 효과
        vec2 crtDistortion(vec2 uv) {
            vec2 cc = uv - 0.5;
            float dist = dot(cc, cc) * 0.3;
            return uv + cc * (0.0, dist) * dist;
        }

        // 스캔라인 효과
        float scanline(vec2 uv) {
            return sin(uv.y * 400.0 + uTime * 5.0) * 0.08 + 0.92;
        }

        void main() {
            vec2 distortedUV = crtDistortion(vUv);
            
            float distanceFromCenter = length(distortedUV - vec2(0.5));
            float radialGradient = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
            
            // 레트로 컬러 팔레트
            vec3 retroColor1 = vec3(0.9, 0.2, 0.8);
            vec3 retroColor2 = vec3(0.2, 0.8, 0.9);
            vec3 retroColor = mix(retroColor1, retroColor2, sin(distortedUV.x * 3.14 + uTime) * 0.5 + 0.5);
            
            // FBM 노이즈 강화 (scale 증가 및 영향력 증가)
            float fbmValue = fbm(distortedUV * 8.0 + uTime * 0.3);
            vec3 color = mix(retroColor, vec3(1.0), fbmValue * 0.5);
            
            // 노이즈와 스캔라인 효과 강화
            float scanlineEffect = scanline(distortedUV);
            float noiseValue = noise(distortedUV * 20.0 + uTime * 0.8) * 0.25;
            
            // 글리치 효과 강화
            float glitch = step(0.95, random(vec2(uTime * 0.15, distortedUV.y * 0.15)));
            color *= (1.0 + glitch * sin(uTime * 60.0) * 0.8);
            
            // 최종 컬러 계산 (노이즈 영향력 증가)
            vec3 finalColor = color * scanlineEffect + noiseValue * 1.5;
            finalColor *= (1.0 + radialGradient * 0.3);
            
            float vignette = 1.0 - distanceFromCenter * 1.5;
            finalColor *= vignette;
            
            gl_FragColor = vec4(finalColor, uOpacity);
        }
        `

// 커스텀 쉐이더 머티리얼 정의
// const WaterShaderMaterial = shaderMaterial(
//   {
//     uTime: 0,
//     uColor: new THREE.Color('#fd72fd'),
//     uOpacity: 0.6, // 투명도 uniform 추가
//   },
//   // Vertex Shader
//   `
//   varying vec2 vUv;
//   varying float vElevation;
//   uniform float uTime;

//   void main() {
//     vUv = uv;
//     vec3 pos = position;

//     vec2 center = vec2(0.0, 0.0);
//     float distance = length(pos.xz - center);

//     // 물결 진폭과 주파수 증가
//     float elevation =
//         sin(distance * 4.0 - uTime * 3.0) * 0.3 * (1.0 / (1.0 + distance * 0.15)) + // 첫 번째 물결 강화
//         sin(distance * 3.0 - uTime * 2.0) * 0.25 * (1.0 / (1.0 + distance * 0.1)) + // 두 번째 물결 추가
//         sin(distance * 2.0 - uTime * 1.5) * 0.2 * (1.0 / (1.0 + distance * 0.08)); // 세 번째 물결 추가

//     pos.y += elevation;
//     vElevation = elevation;

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//   }
//   `,
//   // Fragment Shader
//   `
//         varying vec2 vUv;
//         varying float vElevation;
//         uniform vec3 uColor;
//         uniform vec3 uColor2;
//         uniform float uOpacity;

//         void main() {
//           float distanceFromCenter = length(vUv - vec2(0.5));
//           float radialGradient = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);

//           float highlight = 0.1 / (distance(vUv, vec2(0.5)) + 0.05);

//           // 레트로 그라데이션 효과 추가
//           vec3 retroColor = mix(uColor, uColor2, vUv.x);
//           vec3 color = mix(retroColor, vec3(1.0), vElevation * 0.3 + 0.1);

//           vec3 finalColor = color + highlight * 0.3 * radialGradient;
//           gl_FragColor = vec4(finalColor, uOpacity);
//         }
//         `,
// )

// extend({ WaterShaderMaterial })

const ReflectWater = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#fd72fd') },
      uColor2: { value: new THREE.Color('#ff00ff') },
      uOpacity: { value: 0.8 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniformsNeedUpdate = true
    }
  })

  return (
    <>
      {/* <Environment preset="sunset" /> */}
      <ambientLight intensity={1.5} />
      {/* <directionalLight position={[0, 0, 5]} intensity={1.2} /> */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[30, 30, 256, 256]} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          uniforms={uniforms}
          transparent={true}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      {/* 반사 효과를 위한 메쉬 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 30, 256, 256]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={0.8} // 반사 강도 감소
          roughness={1} // 거칠기 증가
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#fbbfff"
          metalness={0.1} // 금속성 약간 증가
          mirror={0.5} // 거울 효과 감소
          distortion={1} // 왜곡 효과 추가
          //   distortionMap={noise}  // 노이즈 맵 적용
        />
      </mesh>
    </>
  )
}

export default ReflectWater
