import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { TheClimbBranch } from '@/types/theClimbTypes'
import ClimbingList from './climbingList'
import { useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'

const VerticalSwiper: React.FC<{
  theClimbs: TheClimbBranch[]
  onClickLogo: (key: number) => void
}> = ({ theClimbs, onClickLogo }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex)
  }

  console.log('activeIndex', activeIndex)

  const getTranslateY = (index: number) => {
    return index === activeIndex
      ? 50
      : (activeIndex === 0 ? 13 : activeIndex - 1) === index ||
          (activeIndex === 13 ? 0 : activeIndex + 1) === index
        ? 49
        : (activeIndex === 0 ? 13 : activeIndex - 2) === index ||
            (activeIndex === 13 ? 0 : activeIndex + 2) === index
          ? 48
          : 47
  }

  return (
    <div className="h-screen w-screen px-[10px]">
      <Swiper
        direction="horizontal"
        slidesPerView={1.5} // 2.5개의 슬라이드가 보이도록 설정
        centeredSlides={true} // 현재 슬라이드를 중앙에 위치
        // spaceBetween={5}
        loop={true}
        mousewheel={true}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        onActiveIndexChange={handleSlideChange}
        style={{ height: `calc(100vh - 50px)` }}>
        {theClimbs.map((climbingBranch, index) => {
          return (
            <SwiperSlide
              key={climbingBranch.id}
              style={{
                zIndex: getTranslateY(index),
              }}
              className={`relative`}>
              <ClimbingList
                key={climbingBranch.id}
                theClimb={climbingBranch}
                onClickLogo={(key) => onClickLogo(key)}
                index={index}
                activeIndex={activeIndex}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

export default VerticalSwiper
