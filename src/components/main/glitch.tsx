/* eslint-disable @typescript-eslint/no-explicit-any */

import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

declare module '@react-three/fiber' {
  interface ThreeElements {
    textShaderMaterial: any
  }
}

const vertexShader = `
   varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
      `

// const fragmentShader = `
// uniform float uTime;
// uniform vec3 uColor;
// varying vec2 vUv;

// float random(vec2 st) {
//   return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
// }

// void main() {
//   vec2 uv = vUv;
//   float time = uTime;

//   // 느린 수평 글리치
//   float glitchX = sin(uv.y * 40.0 + time * 10.0) * 0.01;
//   uv.x += glitchX;

//   // 느린 RGB 분리
//   float r = smoothstep(0.3, 1.0, fract(uv.x + time * 0.05));
//   float g = smoothstep(0.3, 1.0, fract(uv.x + 0.0));
//   float b = smoothstep(0.3, 1.0, fract(uv.x - time * 0.05));

//   vec3 glitchColor = vec3(r + 0.5, g + 0.5, b + 0.5);

//   // 느린 라인 노이즈
//   float line = step(0.9, fract(sin(uv.y * 300.0 + time * 4.0) * 43758.5453));
//   glitchColor *= line;

//   glitchColor *= uColor;

//   gl_FragColor = vec4(glitchColor, 1.0);
// }
// `
const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float time = uTime;

  // 좌우 흔들림 오프셋 (sin으로 진동)
  float shift = sin(time * 10.0) * 0.02;
  uv.x += shift;

  // RGB 채널 분리 효과 감소 (0.8~1.0 범위로 제한하여 더 안정적인 색상 유지)
  float r = smoothstep(0.3, 0.7, fract(uv.x + time * 0.05)) * 0.2 + 0.8;
  float g = smoothstep(0.3, 0.7, fract(uv.x)) * 0.2 + 0.8;
  float b = smoothstep(0.3, 0.7, fract(uv.x - time * 0.05)) * 0.2 + 0.8;

  vec3 glitchColor = vec3(r, g, b) * uColor;

  gl_FragColor = vec4(glitchColor, uOpacity);
}
`
const fragmentShader2 = `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float time = uTime;

  // 좌우 흔들림 오프셋 (sin으로 진동)
  float shift = sin(time * 10.0) * 0.02;
  uv.x += shift;

  // RGB 채널 분리 효과 감소 (0.8~1.0 범위로 제한하여 더 안정적인 색상 유지)
  float r = smoothstep(0.3, 0.7, fract(uv.x + time * 0.05)) * 0.2 + 0.8;
  float g = smoothstep(0.3, 0.7, fract(uv.x)) * 0.2 + 0.8;
  float b = smoothstep(0.3, 0.7, fract(uv.x - time * 0.05)) * 0.2 + 0.8;

  vec3 glitchColor = vec3(r, g, b) * uColor;

  gl_FragColor = vec4(glitchColor, uOpacity);
}
`

// const TextShaderMaterial = shaderMaterial(
//   {
//     uTime: 0,
//     color: new THREE.Color(1.0, 1.0, 1.0),
//   },
//   // vertex shader는 그대로 유지
//   `
//  precision mediump float;
// attribute vec2 uv;
// varying vec2 vUv;

// void main() {
//     // UV 좌표를 프래그먼트 셰이더로 전달
//     vUv = uv;
//     // 월드-뷰-프로젝션 변환 수행
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }
//       `,
//   // fragment shader 수정
//   `
//  precision mediump float;
// uniform float uTime;
// varying vec2 vUv;

// void main() {
//     // 시간에 따른 오프셋 계산 (예: sin을 이용하여 -0.5~0.5 범위로 변조)
//     float offset = sin(uTime * 2.0) * 0.02;

//     // 원래 UV에서 R, B 채널을 좌우로 이동시킨 좌표 계산
//     vec2 uvR = vUv;
//     uvR.x -= offset;
//     vec2 uvB = vUv;
//     uvB.x += offset;

//     // 기본 텍스처 색상 (예: 흰색 텍스트라 가정)
//     // 단, 실제로 텍스처를 사용하는 경우 sampler2D로 샘플링해야 합니다.
//     // 여기서는 단색(1.0) 대신 텍스처 샘플링 예시를 주석으로 표시합니다.
//     // vec4 texColor = texture2D(uTexture, vUv); // 텍스처를 사용하는 경우
//     vec4 texColor = vec4(1.0); // 일단 기본 흰색 픽셀

//     // 오프셋된 좌표에서 R/B 채널 값 샘플링 (텍스처 사용 시)
//     // float r = texture2D(uTexture, uvR).r;
//     // float b = texture2D(uTexture, uvB).b;

//     // 일단 기본 흰색 픽셀로 가정하면 r = 1.0, b = 1.0
//     float r = 1.0;
//     float b = 1.0;

//     // 원래 색상에서 R, B 채널을 대체하여 RGB 분리 효과
//     vec4 color = texColor;
//     color.r = r;
//     color.b = b;

//     gl_FragColor = color;
// }
//   `,
// )

// extend({ TextShaderMaterial })

const GlitchText = () => {
  const materialRef = useRef<any>(null)
  const materialRef2 = useRef<any>(null)

  const glitchMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('white') },
          uOpacity: { value: 1.0 },
        },
        transparent: true,
      }),
    [],
  )
  const glitchMaterial2 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: fragmentShader2,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('white') },
          uOpacity: { value: 1.0 },
        },
        transparent: true,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    const timeInCycle = time % 2
    if (materialRef.current) {
      materialRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
      if (timeInCycle > 0.5 && timeInCycle < 1.0) {
        // 마지막 0.1초 동안
        const randomValue = Math.random() * 2 - 1
        materialRef2.current.position.x = randomValue
        materialRef.current.material.uniforms.uOpacity.value = 0.5
      } else {
        materialRef.current.material.uniforms.uOpacity.value = 1.0
      }
    }
    if (materialRef2.current) {
      if (timeInCycle > 0.5 && timeInCycle < 1.0) {
        // 마지막 0.1초 동안
        const randomValue = Math.random() * 2 - 1
        materialRef2.current.position.x = randomValue
        materialRef2.current.material.uniforms.uOpacity.value = 0.8
      } else {
        materialRef2.current.material.uniforms.uOpacity.value = 0.0
      }
    }
  })

  return (
    <>
      <Text
        ref={materialRef}
        font="/fonts/Coalition_v2.ttf"
        fontSize={1}
        color="white"
        position={[0, 0, 4]}
        anchorX="center"
        anchorY="middle"
        material={glitchMaterial}>
        The Climb
      </Text>
      <Text
        ref={materialRef2}
        font="/fonts/Coalition_v2.ttf"
        fontSize={1}
        color="white"
        position={[0, 0, 4]}
        anchorX="center"
        anchorY="middle"
        material={glitchMaterial2}>
        The Climb
      </Text>
      {/* <EffectComposer>
        <Glitch
          delay={new THREE.Vector2(0.5, 1.0)} // min and max delay between glitches
          duration={new THREE.Vector2(0.5, 1.0)} // min and max duration of a glitch
          strength={new THREE.Vector2(0.3, 0.5)} // min and max strength
          mode={GlitchMode.CONSTANT_MILD} // glitch mode
          active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
          ratio={0.8} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
        />
      </EffectComposer> */}
    </>
  )
}

export default GlitchText
