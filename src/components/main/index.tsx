'use client'

import { TheClimbBranch } from '@/types/theClimbTypes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Glitch from './glitch'
import TextItem from './TextItem'
import ReflectFloor from './reflectfloor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

function Main() {
  const [theClimbs, setTheClimbs] = useState<TheClimbBranch[]>()
  const [selectedBranch] = useState<undefined | number>()
  const [textPosition, setTextPosition] = useState<{ x: number; y: number }[]>()

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('climbing_branch')
        .select(
          `
        *,
        climbing_post (*)
      `,
        )
        .order('date', { foreignTable: 'climbing_post', ascending: false })
      console.log(data)
      setTheClimbs(data as TheClimbBranch[])
    })()
  }, [])

  // useEffect(() => {
  //   fetch('/api/naver')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data)
  //     })
  // }, [])

  // useEffect(() => {
  //   fetch('/api/test')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data)
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //     })
  // }, [])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative my-[10px] h-[50px] w-[300px]">
        {/* <VFXSpan shader="glitch" className="text-[48px]">
          THE CLIMB
        </VFXSpan> */}
        <Canvas>
          <Glitch />
          <OrbitControls enabled={false} />
        </Canvas>
      </div>
      <div className="flex w-full max-w-[600px] flex-col flex-wrap justify-center gap-4">
        <Canvas
          style={{
            height: 'calc(100vh - 70px)',
            width: '100%',
          }}
          camera={{
            position: [0, 1.4, 8],
          }}
          shadows>
          <ReflectFloor />
          <OrbitControls
            enabled={true}
            minPolarAngle={Math.PI / 2.5} // 수직 각도의 최소값 조정 (60도)
            maxPolarAngle={Math.PI / 2.5} // 수직 각도의 최대값 조정 (60도)
            enableZoom={false}
            enablePan={false}
          />
          {theClimbs &&
            theClimbs.map((branch, index, array) => {
              return (
                <TextItem
                  key={branch.branch}
                  branch={branch}
                  setTextPosition={(x, y) => {
                    setTextPosition((prev) => {
                      if (prev?.find((item) => item.x === x && item.y === y)) {
                        return prev
                      }
                      return [...(prev || []), { x: x, y: y }]
                    })
                  }}
                  textPosition={textPosition}
                  index={index}
                  totalItems={array.length}
                />
              )
            })}
        </Canvas>
      </div>
      {selectedBranch && (
        <div className="flex w-full max-w-[600px] flex-wrap justify-between gap-4 px-[10px]">
          {theClimbs &&
            theClimbs
              .find((branch) => branch.id === selectedBranch)
              ?.climbing_post.map((post) => {
                return (
                  <Link href={post.link} key={post.link} target="_blank">
                    <div className="relative aspect-video w-[100%]">
                      <Image
                        src={post.image}
                        alt={post.link}
                        width={600}
                        height={600}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                )
              })}
        </div>
      )}
    </div>
  )
}

export default Main
