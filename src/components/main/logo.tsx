import {  TheClimbBranch } from "@/types/theClimbTypes"
import Image from "next/image";

const Logo: React.FC<{climbItem: TheClimbBranch, onClickLogo: (key: number) => void}> = ({climbItem, onClickLogo}) => {
    return (
        <div className="cursor-pointer w-[100px] h-[100px] rounded-full overflow-hidden" onClick={() => onClickLogo(climbItem.id)} >
            <Image src={climbItem.logo} alt="logo" width={100} height={100} />
        </div>
    )
}

export default Logo;