'use client'

import { THE_CLIMB_LIST, TheClimb, TheClimbList } from "@/types/theClimbTypes";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo from "./logo";


function Main() {
  const [theClimbs, setTheClimbs] = useState<TheClimb>();
  const [selectedBranch, setSelectedBranch] = useState<TheClimbList | undefined>();

// useEffect(() => {
//   fetch('/api/theclimb')
//   .then(res => res.json())
//   .then(data => {
//     const res = data.data.reduce((acc: TheClimb, item: {data: TheClimb}) => {
//       return {
//         ...acc,
//         ...item.data,
//       }
//     },{})
//     setTheClimbs(res)
//   })
//   .catch(err => {
//     console.error(err)
//   })
// },[])

  const onClickLogo = (key: TheClimbList) => {
    setSelectedBranch(key)
  }

  console.log("selectedBranch",selectedBranch)
  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
      })
  },[])

  return (
    <div className="flex flex-col items-center justify-center">
     <div className="max-w-[600px] w-full flex flex-wrap gap-4 justify-center px-[10px]">
      {
       theClimbs && Object.keys(THE_CLIMB_LIST).map((key) => {
          return (
            <Logo key={key} climbItem={theClimbs[key as TheClimbList]} onClickLogo={(key: TheClimbList) => onClickLogo(key as TheClimbList)}
            branch={key as TheClimbList}
            />
          )
        })
      }
     </div>
     {selectedBranch && (
      <div className="max-w-[600px] w-full flex flex-wrap gap-4 justify-between px-[10px]">
        {theClimbs && theClimbs[selectedBranch].posts.map((post) => {
          return <div key={post.link} className="w-[100%] relative aspect-video">
            <Image src={post.thumbnail} alt={post.link}  
            width={600}
            height={600}
            className="object-cover"
            />
          </div>
        })}
      </div>
     )}
    </div>
  );
}

export default Main;