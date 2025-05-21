import { Text } from '@react-three/drei'
import gsap from 'gsap'
import { useLoader, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { TheClimbBranch } from '@/types/theClimbTypes'
import { the_climbs } from '@/utils/climbs'

const branchNameY = 0.5
const addressY = 0.3
const businessHoursY = 0.1
const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

const fragmentShader = `
  uniform vec3 color;
  uniform vec3 borderColor;
  uniform float borderWidth;
  varying vec2 vUv;

  // 디더링용 4x4 Bayer matrix 패턴
  float dither(vec2 uv) {
    int x = int(mod(uv.x * 4.0, 4.0));
    int y = int(mod(uv.y * 4.0, 4.0));
    int index = y * 4 + x;
    float threshold = float(index) / 16.0;
    return threshold;
  }

  void main() {
    float pixelSize = 24.0;
    vec2 pixelUV = floor(vUv * pixelSize) / pixelSize;
    
    // 픽셀 단위로 테두리 크기 계산
    float borderPixels = 1.0; // 테두리 픽셀 수
    float borderSize = borderPixels / pixelSize;

    // 테두리인지 확인
    bool isBorder = 
      (vUv.x < borderSize || vUv.x > 1.0 - borderSize ||
       vUv.y < borderSize || vUv.y > 1.0 - borderSize);

    vec3 finalColor = color;

    if (isBorder) {
      // 디더링 기반 밝기
      float brightness = 0.8 + dither(vUv) * 0.2;

      // 도트 무늬 추가 (체커보드 스타일)
      float checker = mod(floor(vUv.x * pixelSize) + floor(vUv.y * pixelSize), 2.0);
      float dotFactor = mix(0.9, 1.1, checker); // checker 0이면 0.9, 1이면 1.1
      
      finalColor = borderColor * brightness * dotFactor;
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const TextItem: React.FC<{
  branch: TheClimbBranch
  textPosition:
    | {
        x: number
        y: number
      }[]
    | undefined
  setTextPosition: (x: number, y: number) => void
  index: number
  totalItems: number
}> = ({ branch, index, totalItems }) => {
  const meshRef = useRef(null)
  const textRef = useRef(null)
  const [, setHovered] = useState(false)
  const { camera } = useThree()

  // Card dimensions
  const cardWidth = 1.3
  const cardHeight = 1.5

  const getImages = () => {
    switch (branch.branch) {
      case '신림':
        return `/images/${the_climbs[0].name}_logo.png`
      case '신사':
        return `/images/${the_climbs[1].name}_logo.png`
      case '마곡':
        return `/images/${the_climbs[2].name}_logo.png`
      case '사당':
        return `/images/${the_climbs[3].name}_logo.png`
      case '서울대':
        return `/images/${the_climbs[4].name}_logo.png`
      case '일산':
        return `/images/${the_climbs[5].name}_logo.png`
      case '연남':
        return `/images/${the_climbs[6].name}_logo.png`
      case '홍대':
        return `/images/${the_climbs[7].name}_logo.png`
      case '문래':
        return `/images/${the_climbs[8].name}_logo.png`
      case '이수':
        return `/images/${the_climbs[9].name}_logo.png`
      case '양재':
        return `/images/${the_climbs[10].name}_logo.png`
      case '강남':
        return `/images/${the_climbs[11].name}_logo.png`
      case '성수':
        return `/images/${the_climbs[12].name}_logo.png`
      case '논현':
        return `/images/${the_climbs[13].name}_logo.png`
      default:
        return ''
    }
  }

  const texture = useLoader(THREE.TextureLoader, getImages())

  const moveCamera = (targetPosition: THREE.Vector3) => {
    // 카메라가 바라볼 위치
    const lookAtPosition = targetPosition.clone()

    // 현재 카메라의 높이(y)와 반지름 유지
    const currentHeight = camera.position.y
    const radius = 3 // 원의 반지름 (group position에서 사용된 값과 동일)

    // 카메라 위치 계산 (현재 높이와 반지름 유지)
    const cameraPosition = targetPosition.clone()
    cameraPosition.y = currentHeight
    const direction = new THREE.Vector3(0, 0, 1)
    direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (index / totalItems) * Math.PI * 2,
    )
    direction.multiplyScalar(radius)
    cameraPosition.add(direction)

    // 카메라 이동 애니메이션
    gsap.to(camera.position, {
      duration: 1,
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
      ease: 'power2.inOut',
    })
    // 카메라가 바라보는 방향 애니메이션
    camera.lookAt(lookAtPosition)
    gsap.to(camera.position, {
      duration: 1,
      ease: 'power2.inOut',
    })
  }

  const handleClick = () => {
    if (meshRef.current) {
      const meshPosition = new THREE.Vector3()
      // @ts-expect-error (meshRef.current의 타입 에러 무시)
      meshRef.current.getWorldPosition(meshPosition)
      moveCamera(meshPosition)
      console.log(`Clicked branch: ${branch}`)
    }
  }

  //   useEffect(() => {
  //     if (meshRef.current) {
  //       // @ts-ignore (meshRef.current의 타입 에러 무시)
  //       meshRef.current.raycast = (
  //         raycaster: THREE.Raycaster,
  //         intersects: THREE.Intersection[],
  //       ) => {
  //         // 기본 레이캐스트 실행
  //         THREE.Mesh.prototype.raycast.call(
  //           meshRef.current,
  //           raycaster,
  //           intersects,
  //         )

  //         // 카메라 방향과 교차점의 법선 벡터를 비교하여 정렬
  //         intersects.sort((a, b) => {
  //           const normalA = a.face?.normal || new THREE.Vector3()
  //           const normalB = b.face?.normal || new THREE.Vector3()

  //           // 월드 좌표계로 변환
  //           const worldNormalA = normalA
  //             .clone()
  //             .applyQuaternion(meshRef.current.quaternion)
  //           const worldNormalB = normalB
  //             .clone()
  //             .applyQuaternion(meshRef.current.quaternion)

  //           // 카메라 방향 벡터
  //           const cameraDirection = raycaster.ray.direction

  //           // 카메라 방향과 법선 벡터의 내적 (더 작은 값이 카메라를 향함)
  //           const dotA = cameraDirection.dot(worldNormalA)
  //           const dotB = cameraDirection.dot(worldNormalB)

  //           return dotA - dotB
  //         })

  //         // 카메라를 향하는 면의 교차점만 유지
  //         const frontIntersect = intersects[0]
  //         intersects.length = 0
  //         if (frontIntersect) {
  //           intersects.push(frontIntersect)
  //         }
  //       }
  //     }
  //   }, [])

  return (
    <group
      position={[
        Math.sin((index / totalItems) * Math.PI * 2) * 4,
        1, // 바닥에서 약간 띄우기
        Math.cos((index / totalItems) * Math.PI * 2) * 4,
      ]}
      rotation={[0, (index / totalItems) * Math.PI * 2, 0]}>
      {/* 뒷면 이미지 */}
      <mesh position={[0, 0, -0.01]} scale={[-1, 1, 1]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>

      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <shaderMaterial
          side={THREE.DoubleSide}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            color: { value: new THREE.Color('#1c1c3c') },
            borderColor: { value: new THREE.Color('#555555') },
            borderWidth: { value: 0.02 },
          }}
        />
        <Text
          ref={textRef}
          font="/fonts/DungGeunMo.otf"
          fontSize={0.15}
          color="white"
          position={[0, branchNameY, 0.01]}
          anchorX="center"
          anchorY="middle"
          strokeWidth={0.003} // 외곽선 두께 추가
          strokeColor="#f51414">
          {branch.branch}
        </Text>
        <Text
          ref={textRef}
          font="/fonts/DungGeunMo.otf"
          fontSize={0.15}
          color="red"
          position={[-0.0001, -0.01 + branchNameY, 0.009]}
          anchorX="center"
          anchorY="middle">
          {branch.branch}
        </Text>
        <Text
          ref={textRef}
          font="/fonts/DungGeunMo.otf"
          fontSize={0.15}
          color="red"
          position={[-0.0001, -0.02 + branchNameY, 0.008]}
          anchorX="center"
          anchorY="middle">
          {branch.branch}
        </Text>

        {/* 주소 */}
        <Text
          font="/fonts/DungGeunMo.otf"
          fontSize={0.08}
          color="white"
          position={[0, 0 + addressY, 0.01]}
          anchorX="center"
          anchorY="middle">
          {branch.address
            .split(' ')
            .slice(0, 4)
            .map((item) => {
              return `${item} `
            })}
        </Text>
        <Text
          font="/fonts/DungGeunMo.otf"
          fontSize={0.08}
          color="white"
          position={[0, -0.1 + addressY, 0.01]}
          anchorX="center"
          anchorY="middle">
          {branch.address
            .split(' ')
            .slice(4)
            .map((item) => {
              return `${item} `
            })}
        </Text>

        {/* 영업시간 */}
        {branch.business_hours.map((item, index) => {
          return (
            <Text
              key={index}
              font="/fonts/DungGeunMo.otf"
              fontSize={0.08}
              color="white"
              position={[0, index * -businessHoursY, 0.01]}
              anchorX="center"
              anchorY="middle">
              {`${item[0]} ${item[1]}`}
            </Text>
          )
        })}
      </mesh>
    </group>
  )
}

export default TextItem
