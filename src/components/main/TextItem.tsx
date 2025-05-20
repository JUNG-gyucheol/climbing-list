import { Text } from '@react-three/drei'
import gsap from 'gsap'
import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const TextItem: React.FC<{
  branch: string
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
  const cardWidth = 1
  const cardHeight = 1

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
        Math.sin((index / totalItems) * Math.PI * 2) * 3,
        0.5, // 바닥에서 약간 띄우기
        Math.cos((index / totalItems) * Math.PI * 2) * 3,
      ]}
      rotation={[0, (index / totalItems) * Math.PI * 2, 0]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial color="#86e569" side={THREE.DoubleSide} />
        <Text
          ref={textRef}
          font="/fonts/DungGeunMo.otf"
          fontSize={0.15}
          color="white"
          position={[0, 0, 0.01]}
          anchorX="center"
          anchorY="middle">
          {branch}
        </Text>
      </mesh>
    </group>
  )
}

export default TextItem
