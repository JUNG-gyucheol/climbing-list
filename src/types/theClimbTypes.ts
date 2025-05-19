export const THE_CLIMB_LIST = {
  the_climb_magok: 'the_climb_magok',
  the_climb_sillim: 'the_climb_sillim',
  the_climb_sadang: 'the_climb_sadang',
  the_climb_snu: 'the_climb_snu',
  the_climb_ilsan: 'the_climb_ilsan',
  the_climb_yeonnam: 'the_climb_yeonnam',
  the_climb_b_hongdae: 'the_climb_b_hongdae',
  the_climb_mullae: 'the_climb_mullae',
  the_climb_isu: 'the_climb_isu',
  the_climb_yangjae: 'the_climb_yangjae',
  the_climb_gangnam: 'the_climb_gangnam',
  the_climb_seongsu: 'the_climb_seongsu',
  the_climb_sinsa: 'the_climb_sinsa',
  the_climb_nonhyeon: 'the_climb_nonhyeon',
}

export type TheClimbList = keyof typeof THE_CLIMB_LIST

export type TheClimbItem = {
  logo: string
  posts: {
    h1: string[]
    img: string[]
    link: string
    thumbnail: string
    timestamp: string
  }[]
}

export type TheClimb = {
  [key in TheClimbList]: TheClimbItem
}

export type TheClimbPost = {
  branch_id: number
  brand: string
  created_at: string
  description: string
  id: number
  image: string
  link: string
  timestamp: string
}

export type TheClimbBranch = {
  branch: string
  brand: string
  created_at: string
  id: number
  insta_url: string
  logo: string
  climbing_post: TheClimbPost[]
  address: string
  business_hours: [string, string][]
}
