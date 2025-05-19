import { TheClimbBranch } from '@/types/theClimbTypes'
import { FaChevronDown } from 'react-icons/fa6'
import Logo from './logo'
import dayjs from 'dayjs'
import { useState } from 'react'

const ClimbingList: React.FC<{
  theClimb: TheClimbBranch
  onClickLogo: (key: number) => void
}> = ({ theClimb, onClickLogo }) => {
  //   console.log('theClimb', theClimb)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex w-full gap-[20px] rounded-[10px] bg-white p-[10px]">
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
            {`${dayjs().format('MM/DD')}(${dayjs().get('d') === 0 ? theClimb.business_hours[6][0] : theClimb.business_hours[dayjs().get('d') - 1][0]}) ${dayjs().get('d') === 0 ? theClimb.business_hours[6][1] : theClimb.business_hours[dayjs().get('d')][1]}`}
          </span>
          <span className={`${isOpen ? 'rotate-180' : ''}`}>
            <FaChevronDown />
          </span>
          {isOpen && (
            <div className="absolute top-[30px] left-0 z-[100] flex w-full cursor-default flex-col rounded-[10px] border-[1px] border-black bg-white p-[10px]">
              {theClimb.business_hours.map((hour) => {
                return (
                  <span key={`${hour[0]}-${hour[1]}`}>
                    {hour[0]} {hour[1]}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClimbingList
