import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const the_climb = [
  { url: 'theclimb_sillim', name: 'the_climb_sillim', ko: '신림' },
  { url: 'theclimb_sinsa', name: 'the_climb_sinsa', ko: '신사' },
  { url: 'theclimb_magok', name: 'the_climb_magok', ko: '마곡' },
  { url: 'theclimb_sadang', name: 'the_climb_sadang', ko: '사당' },
  { url: 'theclimb_snu', name: 'the_climb_snu', ko: '서울대' },
  { url: 'theclimb_ilsan', name: 'the_climb_ilsan', ko: '일산' },
  { url: 'theclimb_yeonnam', name: 'the_climb_yeonnam', ko: '연남' },
  { url: 'theclimb_b_hongdae', name: 'the_climb_b_hongdae', ko: '홍대' },
  { url: 'theclimb_mullae', name: 'the_climb_mullae', ko: '문래' },
  { url: 'theclimb_isu', name: 'the_climb_isu', ko: '이수' },
  { url: 'theclimb_yangjae', name: 'the_climb_yangjae', ko: '양재' },
  { url: 'theclimb_gangnam', name: 'the_climb_gangnam', ko: '강남' },
  { url: 'theclimb_seongsu', name: 'the_climb_seongsu', ko: '성수' },
  { url: 'theclimb_nonhyeon', name: 'the_climb_nonhyeon', ko: '논현' },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

export async function GET() {
  try {
    // 클라이밍 브랜드 데이터 삽입 있다면 에러 발생 후 패스
    const { data, error } = await supabase.from('climbing').insert({
      name: '더클라임',
    })
    // await supabase.from('climbing_post').delete().eq('brand', '더클라임')
    // return NextResponse.json({ success: true })

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    await page.waitForSelector('input[name="username"]')

    await page.type(
      'input[name="username"]',
      process.env.NEXT_PUBLIC_INSTAGRAM_ID as string,
    )
    await page.type(
      'input[name="password"]',
      process.env.NEXT_PUBLIC_INSTAGRAM_PASSWORD as string,
    )

    await page.click('button[type="submit"]')

    await page.waitForSelector('img[alt="ggyu_ppi님의 프로필 사진"]', {
      timeout: 100000,
    })

    for (let i = 0; i < the_climb.length; i++) {
      await page.goto(`https://www.instagram.com/${the_climb[i].url}/`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      // const title = await page.title();
      // 스크롤 함수 추가
      await page.evaluate(async () => {
        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms))

        for (let i = 0; i < 1; i++) {
          // 3번 스크롤
          window.scrollTo(0, document.body.scrollHeight)
          await delay(5000) // 1.5초 대기
        }
      })

      // 컨텐츠 로드를 위해 잠시 대기
      await page.waitForSelector('img', { timeout: 10000 })

      // await page.waitForSelector('img', { timeout: 5000 });
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img')
        const linkElements = document.querySelectorAll('a')

        return {
          logo: imgElements[0].src,
          images: Array.from(imgElements, (img) => img)
            .filter((img) => !img.src.includes('150x150'))
            .slice(1)
            .map((img) => img.src),
          description: Array.from(imgElements, (img) => img)
            .filter((img) => !img.src.includes('150x150'))
            .slice(1)
            .map((img) => img.alt),
          links: Array.from(linkElements, (link) => link.href).filter((link) =>
            link.includes('/p/'),
          ),
        }
      })

      /**
       *  포스트 데이터 포맷팅(문제풀이 / 카탈로그 게시물 제거)
       */
      const formatedData = images.links.map((link, index) => {
        //   const settingRegex =
        //     /문제풀이|문제 풀이|풀이|카탈로그|CATALOG|catalog|카 탈 로 그/i
        //   const settingRegex2 = /세팅|SETTING|NEW SETTING|셋팅/i
        //   const description = images.description[index] || ''
        //   const descriptionWithoutHashtags = description.replace(
        //     /#[^\s#]+/g,
        //     '',
        //   )
        //   if (
        //     settingRegex.test(descriptionWithoutHashtags) &&
        //     !settingRegex2.test(descriptionWithoutHashtags)
        //   )
        //     return null
        return {
          link,
          description: images.description[index],
          image: images.images[index],
        }
      })

      /**
       * 브랜치 데이터 조회 후 게시물 데이터 삽입
       */
      const { data: branchData } = await supabase
        .from('climbing_branch')
        .select('id')
        .eq('branch', the_climb[i].ko)

      if (branchData && branchData.length > 0) {
        const links = formatedData.map((item) => item.link)

        const { data: existingPosts } = await supabase
          .from('climbing_post')
          .select('link')
          .in('link', links)
          .eq('branch_id', branchData[0].id)

        // 존재하는 링크들을 Set으로 변환
        const existingLinks = new Set(existingPosts?.map((post) => post.link))

        const rowToInsert = formatedData
          .filter((item) => !existingLinks.has(item.link))
          .map((item) => ({
            image: item.image,
            description: item.description,
            link: item.link,
            brand: '더클라임',
            branch_id: branchData[0].id as number,
            date: '',
          }))
        for (let j = 0; j < rowToInsert.length; j++) {
          await page.goto(rowToInsert[j].link, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          })
          await page.waitForSelector('img', { timeout: 10000 })
          const time = await page.evaluate(() => {
            const timeElements = document.querySelectorAll('time')
            return timeElements[0].dateTime
          })
          rowToInsert[j].date = time
        }

        // 새로운 데이터만 삽입
        if (rowToInsert.length > 0) {
          await supabase.from('climbing_post').insert(rowToInsert)
        }
      }
      if (i + 1 === the_climb.length) {
        await browser.close()
        return NextResponse.json({ success: true })
      }
    }

    //   await browser.close();
    // console.log(content)
    // return NextResponse.json({ message: content })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
