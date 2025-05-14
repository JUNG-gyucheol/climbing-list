
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js'

const the_climb = [
    {url: "theclimb_sinsa",name:"the_climb_sinsa", ko:"신사"}, 
    {url: "theclimb_magok",name:"the_climb_magok", ko:"마곡"}, 
    {url: "theclimb_sillim",name:"the_climb_sillim", ko:"신림"}, 
    {url: "theclimb_sadang",name:"the_climb_sadang", ko:"사당"},
    {url: "theclimb_snu",name:"the_climb_snu", ko:"서울대"}, 
    {url: "theclimb_ilsan",name:"the_climb_ilsan", ko:"일산"}, 
    {url: "theclimb_yeonnam",name:"the_climb_yeonnam", ko:"연남"}, 
    {url: "theclimb_b_hongdae",name:"the_climb_b_hongdae", ko:"홍대"}, 
    {url: "theclimb_mullae",name:"the_climb_mullae", ko:"문래"}, 
    {url: "theclimb_isu",name:"the_climb_isu", ko:"이수"}, 
    {url: "theclimb_yangjae",name:"the_climb_yangjae", ko:"양재"}, 
    {url: "theclimb_gangnam",name:"the_climb_gangnam", ko:"강남"}, 
    {url: "theclimb_seongsu",name:"the_climb_seongsu", ko:"성수"}, 
    {url: "theclimb_nonhyeon",name:"the_climb_nonhyeon", ko:"논현"}]

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    export async function GET() {
        try {
        
           const {data, error} = await supabase.from('climbing').insert({
                name: '더클라임',
            })
            console.log(data, error)

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto('https://www.instagram.com/accounts/login/',{
        waitUntil: 'networkidle0',
        timeout: 30000
    });
    await page.waitForSelector('input[name="username"]');

    
    await page.type('input[name="username"]', process.env.NEXT_PUBLIC_INSTAGRAM_ID as string);
    await page.type('input[name="password"]', process.env.NEXT_PUBLIC_INSTAGRAM_PASSWORD as string);
    
    console.log(process.env.NEXT_PUBLIC_INSTAGRAM_ID as string, process.env.NEXT_PUBLIC_INSTAGRAM_PASSWORD as string)
    await page.click('button[type="submit"]');
 
    await page.waitForSelector('img[alt="ggyu_ppi님의 프로필 사진"]',{timeout: 100000});
    for(let i = 0; i < 1; i++){
        await page.goto(`https://www.instagram.com/${the_climb[i].url}/`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
    
    
        // const title = await page.title();
         // 스크롤 함수 추가
        //  await page.evaluate(async () => {
        //     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            
        //     for (let i = 0; i < 1; i++) {  // 3번 스크롤
        //         window.scrollTo(0, document.body.scrollHeight);
        //         await delay(1500);  // 1.5초 대기
        //     }
        // });
    
           // 컨텐츠 로드를 위해 잠시 대기
           await page.waitForSelector('img', { timeout: 10000 });
    
        // await page.waitForSelector('img', { timeout: 5000 });
        const images = await page.evaluate((currentUrl) => {
            const imgElements = document.querySelectorAll('img')
            const linkElements = document.querySelectorAll('a');

            return {
                logo : imgElements[0].src,
                images: Array.from(imgElements, img => img.src).filter(img => (!img.includes('150x150'))).slice(1),
                description:Array.from(imgElements, img => img).filter(img => (!img.src.includes('150x150'))).slice(1).map((img) => img.alt),
                links: Array.from(linkElements, link => link.href).filter(link => link.includes(currentUrl) || link.includes("https://www.instagram.com/theclimb_life/p/")),
            };
          },`https://www.instagram.com/${the_climb[i].url}/p/`);

    
        //   console.log(images)
         const formatedData =  images.links.map((link, index) => {
            const settingRegex = /세팅|셋팅|setting|영업시간/i;
            const description = images.description[index] || '';
            // Exclude hashtags when checking for setting-related text
            const descriptionWithoutHashtags = description.replace(/#[^\s#]+/g, '');
            if(!settingRegex.test(descriptionWithoutHashtags)) return null;
            return {
                link,
                description:images.description[index],
                image:images.images[index]
            }
          }).filter(v => v !== null)

          const {data:branchData, error:branchError} = await supabase.from('climbing_branch').select('id').eq('name', the_climb[i].name)
          console.log(branchData)

        //   for(let i = 0; i < formatedData.length; i++){
        //     const {data, error} = await supabase.from('climbing_post').insert({
        //         brand: '더클라임',
        //         branch_id: branchData,
        //         logo: images.logo,
        //         insta_url:`https://www.instagram.com/${the_climb[i].url}/`,
        //     })
        //   }
        //   const {data, error} = await supabase.from('climbing_branch')sele.insert({
        //     brand: '더클라임',
        //     branch: the_climb[i].ko,
        //     logo: images.logo,
        //     insta_url:`https://www.instagram.com/${the_climb[i].url}/`,
        // })
        // console.log(data, error)

        


        // const itemData:{
        //     h1: (string | null)[];
        //     img: string[];
        //     time: string | null | undefined;
        // }[] = []
        // for(let i = 0; i < images.links.length; i++){
        //     console.log(images.links[i])
        //     await page.goto(images.links[i], {
        //         waitUntil: 'networkidle0',
        //         timeout: 30000
        //     });
        //     const data  = await page.evaluate(() => {
        //         const h1Elements = document.querySelectorAll('h1');
        //         const imgElements = document.querySelectorAll('article img');
        //         const ulimgElements = document.querySelectorAll('ul img');
        //         const timeElements = document.querySelector('time');
        //         return {
        //             h1: Array.from(h1Elements, h1Elements => h1Elements.textContent),
        //             img: Array.from(imgElements, img => img.src).filter(img => (!img.includes('150x150'))),
        //             time:  timeElements?.getAttribute('datetime'),
        //             ulimg: Array.from(ulimgElements, ulimg => ulimg.src).filter(ulimg => (!ulimg.includes('150x150')))
        //         }
        //       });
        //       itemData.push(data)
        //       // const title = await page.title();
        //       // console.log(title)
        //     }
        //     // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        //     // const fileName = `the_climb.json`;
        //     const jsonData = {
        //         crawledAt: new Date(),
        //         data: {
        //             [the_climb[i].name]:  {
        //                 logo: images.logo,
        //                 posts:images.links.filter((link, index) => {
        //                     const settingRegex = /세팅|셋팅|setting|영업시간/i;
        //                     return itemData[index]?.h1.some(h1 => settingRegex.test(h1 || ''));
        //                     // return{
        //                     //     thumbnail: images.images[index],
        //                     //     link,
        //                     //     h1: itemData[index]?.h1,
        //                     //     img: itemData[index]?.img,
        //                     //     time: itemData[index]?.time
        //                     // }
        //             })}
        //         }
        //     };
            // console.log(jsonData)
    
            // const dirPath = path.join(process.cwd(), 'public', 'json');
            // const filePath = path.join(dirPath, fileName);
            
            // await mkdir(dirPath, { recursive: true });
    
            // let existingData = [];
        
            // // 기존 파일이 있으면 읽기
            // if (existsSync(filePath)) {
            //   const fileContent = await readFile(filePath, 'utf-8');
            //   existingData = JSON.parse(fileContent);
            // }
    
            //   // 새 데이터를 배열의 앞에 추가 (최신 데이터가 앞으로)
            // existingData.unshift(jsonData);
            
            // await writeFile(filePath, JSON.stringify(existingData, null, 2));
            // console.log(`데이터가 ${filePath}에 저장되었습니다.`);
            // if(i + 1 === the_climb.length){
            //     await browser.close();
            //     return NextResponse.json({ success: true, images: images });
            // }
            return NextResponse.json({ success: true,images,l });
    }

    //   await browser.close();
    // console.log(content)
    // return NextResponse.json({ message: content })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
