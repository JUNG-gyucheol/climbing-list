export const THE_CLIMB_LIST = {
    the_climb_magok: "the_climb_magok",
    the_climb_sillim: "the_climb_sillim",
    the_climb_sadang: "the_climb_sadang",
    the_climb_snu: "the_climb_snu",
    the_climb_ilsan: "the_climb_ilsan",
    the_climb_yeonnam: "the_climb_yeonnam",
    the_climb_b_hongdae: "the_climb_b_hongdae",
    the_climb_mullae: "the_climb_mullae",
    the_climb_isu: "the_climb_isu",
    the_climb_yangjae: "the_climb_yangjae",
    the_climb_gangnam: "the_climb_gangnam",
    the_climb_seongsu: "the_climb_seongsu",
    the_climb_sinsa: "the_climb_sinsa",
    the_climb_nonhyeon: "the_climb_nonhyeon"
}

export type TheClimbList = keyof typeof THE_CLIMB_LIST;

export type TheClimbItem = {
    logo:string;
    posts:{
      h1:string[];
      img:string[];
      link:string;
      thumbnail:string;
      timestamp:string;
    }[]
  }
  
  export type TheClimb = {
    [key in TheClimbList]: TheClimbItem
  }
