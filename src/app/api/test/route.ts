
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const the_climb = [
    {url: "theclimb_magok",name:"the_climb_magok"}, 
    {url: "theclimb_sillim",name:"the_climb_sillim"}, 
    {url: "theclimb_sadang",name:"the_climb_sadang"},
    {url: "theclimb_snu",name:"the_climb_snu"}, 
    {url: "theclimb_ilsan",name:"the_climb_ilsan"}, 
    {url: "theclimb_yeonnam",name:"the_climb_yeonnam"}, 
    {url: "theclimb_b_hongdae",name:"the_climb_b_hongdae"}, 
    {url: "theclimb_mullae",name:"the_climb_mullae"}, 
    {url: "theclimb_isu",name:"the_climb_isu"}, 
    {url: "theclimb_yangjae",name:"the_climb_yangjae"}, 
    {url: "theclimb_gangnam",name:"the_climb_gangnam"}, 
    {url: "theclimb_seongsu",name:"the_climb_seongsu"}, 
    {url: "theclimb_sinsa",name:"the_climb_sinsa"}, 
    {url: "theclimb_nonhyeon",name:"the_climb_nonhyeon"}]

export async function GET() {
    try {
    const browser = await puppeteer.launch({
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
    
    await page.click('button[type="submit"]');
    
    const url =  page.url();
    console.log(url)

    for(let i = 0; i < the_climb.length; i++){
        if(i === 0){
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
        await page.goto(`https://www.instagram.com/${the_climb[i].url}/`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        const url2 =  page.url();
        console.log(url2)
    
    
        // const title = await page.title();
         // 스크롤 함수 추가
         await page.evaluate(async () => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            
            for (let i = 0; i < 1; i++) {  // 3번 스크롤
                window.scrollTo(0, document.body.scrollHeight);
                await delay(1500);  // 1.5초 대기
            }
        });
    
           // 컨텐츠 로드를 위해 잠시 대기
           await page.waitForSelector('img', { timeout: 5000 });
    
        // await page.waitForSelector('img', { timeout: 5000 });
        const images = await page.evaluate((currentUrl) => {
            const imgElements = document.querySelectorAll('img');
            const linkElements = document.querySelectorAll('a');
            return {
                logo : imgElements[0].src,
                images: Array.from(imgElements, img => img.src).filter(img => img.includes('_e35')).slice(0, 12),
                links: Array.from(linkElements, link => link.href).filter(link => link.includes(currentUrl)).slice(0, 12)
            };
          },`https://www.instagram.com/${the_climb[i].url}/p/`);
    
        const itemData:{
            h1: (string | null)[];
            img: string[];
            time: string | null | undefined;
        }[] = []
        for(let i = 0; i < images.links.length; i++){
            console.log(images.links[i])
            await page.goto(images.links[i], {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            const data  = await page.evaluate(() => {
                const h1Elements = document.querySelectorAll('h1');
                const imgElements = document.querySelectorAll('img');
                const timeElements = document.querySelector('time');
                return {
                    h1: Array.from(h1Elements, h1Elements => h1Elements.textContent),
                    img: Array.from(imgElements, img => img.src),
                    time:  timeElements?.getAttribute('datetime')
                }
              });
              itemData.push(data)
              // const title = await page.title();
              // console.log(title)
            }
            // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `the_climb.json`;
        
            const jsonData = {
                crawledAt: new Date(),
                data: {
                    [the_climb[i].name]:  {
                        logo: images.logo,
                        posts:images.links.map((link, index) => ({
                        thumbnail: images.images[index],
                        link,
                        h1: itemData[index]?.h1,
                        img: itemData[index]?.img,
                        time: itemData[index]?.time
                    }))}
                }
            };
    
            const dirPath = path.join(process.cwd(), 'public', 'json');
            const filePath = path.join(dirPath, fileName);
            
            await mkdir(dirPath, { recursive: true });
    
            let existingData = [];
        
            // 기존 파일이 있으면 읽기
            if (existsSync(filePath)) {
              const fileContent = await readFile(filePath, 'utf-8');
              existingData = JSON.parse(fileContent);
            }
    
              // 새 데이터를 배열의 앞에 추가 (최신 데이터가 앞으로)
            existingData.unshift(jsonData);
            
            await writeFile(filePath, JSON.stringify(existingData, null, 2));
            console.log(`데이터가 ${filePath}에 저장되었습니다.`);
            // if(i + 1 === the_climb.length){
            //     await browser.close();
            //     return NextResponse.json({ success: true });
            // }
    }

      await browser.close();
      return NextResponse.json({ success: true });
    // console.log(content)
    // return NextResponse.json({ message: content })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
