'use client'

import { TheClimbBranch } from '@/types/theClimbTypes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Logo from './logo'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

function Main() {
  const [theClimbs, setTheClimbs] = useState<TheClimbBranch[]>()
  const [selectedBranch, setSelectedBranch] = useState<undefined | number>()

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

  const onClickLogo = (key: number) => {
    setSelectedBranch(key)
  }

  useEffect(() => {
    fetch('/api/naver')
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
      })
  }, [])
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
      <div className="flex w-full max-w-[600px] flex-wrap justify-center gap-4 px-[10px]">
        {theClimbs &&
          theClimbs.map((climbingBranch) => {
            return (
              <Logo
                key={climbingBranch.id}
                climbItem={climbingBranch}
                onClickLogo={(key) => onClickLogo(key)}
              />
            )
          })}
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
