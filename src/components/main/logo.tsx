import {  TheClimbItem, TheClimbList } from "@/types/theClimbTypes"
import Image from "next/image";

const Logo: React.FC<{climbItem: TheClimbItem, onClickLogo: (key: TheClimbList) => void, branch: TheClimbList}> = ({climbItem, onClickLogo, branch}) => {
    return (
        <div className="cursor-pointer w-[100px] h-[100px] rounded-full overflow-hidden" onClick={() => onClickLogo(branch)} >
            <Image src={climbItem.logo} alt="logo" width={100} height={100} />
        </div>
    )
}

export default Logo;