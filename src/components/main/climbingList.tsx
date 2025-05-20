import { TheClimbBranch } from '@/types/theClimbTypes'
import { FaChevronDown } from 'react-icons/fa6'
import Logo from './logo'
import dayjs from 'dayjs'
import { useState } from 'react'

const ClimbingList: React.FC<{
  theClimb: TheClimbBranch
  onClickLogo: (key: number) => void
  index: number
  activeIndex: number
}> = ({ theClimb, onClickLogo, index, activeIndex }) => {
  //   console.log('theClimb', theClimb)
  const [isOpen, setIsOpen] = useState(false)

  // console.log('slideData', slideData)

  const getTranslateY = () => {
    return index === activeIndex ? 50 : 55
  }
  return (
    <div
      style={{
        transform: `translateY(-${getTranslateY()}%)`,
      }}
      className={`${index === activeIndex ? 'bg-amber-300' : 'scale-90 bg-white opacity-70'} absolute top-[50%] left-[50%] flex h-[450px] w-[300px] translate-x-[-50%] flex-col items-center justify-center gap-[20px] rounded-[10px] border-[1px] border-amber-300 p-[10px] transition-all duration-300`}>
      <div>
        <Logo
          key={theClimb.id}
          climbItem={theClimb}
          onClickLogo={(key) => onClickLogo(key)}
        />
      </div>
      <div className="flex flex-col gap-[5px] text-black">
        <span>
          {theClimb.brand} {theClimb.branch}
        </span>
        <span>{theClimb.address}</span>
        <div
          className="relative flex cursor-pointer items-center gap-[5px]"
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
          onBlur={() => {
            console.log('onBlur')
            setIsOpen(false)
          }}>
          <span className="text-[18px] font-bold">
            {`${dayjs().format('MM/DD')}(${theClimb.business_hours[0][0]}) ${theClimb.business_hours[0][1]}`}
          </span>
          <span className={`${isOpen ? 'rotate-180' : ''}`}>
            <FaChevronDown />
          </span>
          {/* {true && (
            <div className="top-[30px] left-0 z-[100] flex w-full cursor-default flex-col rounded-[10px] border-[1px] border-black bg-white p-[10px]">
              {theClimb.business_hours.map((hour) => {
                return (
                  <span key={`${hour[0]}-${hour[1]}`}>
                    {hour[0]} {hour[1]}
                  </span>
                )
              })}
            </div>
          )} */}
        </div>
        <div className="top-[30px] left-0 z-[100] flex w-full cursor-default flex-col rounded-[10px] border-[1px] border-black bg-white p-[10px]">
          {theClimb.business_hours.map((hour) => {
            return (
              <span key={`${hour[0]}-${hour[1]}`}>
                {hour[0]} {hour[1]}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ClimbingList
