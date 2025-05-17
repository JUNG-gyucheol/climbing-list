import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'

// const the_climb = [
//   { url: 'theclimb_sillim', name: 'the_climb_sillim', ko: '신림' },
//   { url: 'theclimb_sinsa', name: 'the_climb_sinsa', ko: '신사' },
//   { url: 'theclimb_magok', name: 'the_climb_magok', ko: '마곡' },
//   { url: 'theclimb_sadang', name: 'the_climb_sadang', ko: '사당' },
//   { url: 'theclimb_snu', name: 'the_climb_snu', ko: '서울대' },
//   { url: 'theclimb_ilsan', name: 'the_climb_ilsan', ko: '일산' },
//   { url: 'theclimb_yeonnam', name: 'the_climb_yeonnam', ko: '연남' },
//   { url: 'theclimb_b_hongdae', name: 'the_climb_b_hongdae', ko: '홍대' },
//   { url: 'theclimb_mullae', name: 'the_climb_mullae', ko: '문래' },
//   { url: 'theclimb_isu', name: 'the_climb_isu', ko: '이수' },
//   { url: 'theclimb_yangjae', name: 'the_climb_yangjae', ko: '양재' },
//   { url: 'theclimb_gangnam', name: 'the_climb_gangnam', ko: '강남' },
//   { url: 'theclimb_seongsu', name: 'the_climb_seongsu', ko: '성수' },
//   { url: 'theclimb_nonhyeon', name: 'the_climb_nonhyeon', ko: '논현' },
// ]

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL as string,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
// )

export async function GET() {
  try {
    // 클라이밍 브랜드 데이터 삽입 있다면 에러 발생 후 패스
    // const { data, error } = await supabase.from('climbing').insert({
    //   name: '더클라임',
    // })
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

    await page.goto(
      'https://map.naver.com/p/search/%EB%8D%94%20%ED%81%B4%EB%9D%BC%EC%9E%84%20%EC%8B%A0%EB%A6%BC',
    )
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const searchFrame = await page.$('#searchIframe')
    const frame = await searchFrame?.contentFrame()
    console.log(frame)
    if (!frame) {
      throw new Error('iframe not found')
    }

    const content = await frame.evaluate(async () => {
      const content = document.querySelectorAll('ul span')
      for (const span of content) {
        if (span.textContent?.includes('더클라임 신림점')) {
          ;(span as HTMLElement).click()
          return
        }
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 5000))
    const url = page.url()
    console.log(url)

    await page.goto(url)
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const EntryIFrame = await page.$('#entryIframe')
    const entryFrame = await EntryIFrame?.contentFrame()

    if (!entryFrame) {
      throw new Error('entryFrame not found')
    }
    const content2 = await entryFrame.evaluate(async () => {
      const content = document.querySelectorAll('em')
      content[0].click()
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const parentElement =
        content[0].parentElement?.parentElement?.parentElement
      const firstClass = parentElement?.classList[0]
      const children = document.querySelectorAll(`div[class="${firstClass}"]`)
      return Array.from(children).map((item) => item.textContent)
    })
    // await new Promise((resolve) => setTimeout(resolve, 3000))
    // await page.evaluate(() => {
    //   const content = document.querySelectorAll('span')
    //   return Array.from(content).map((item) => item.textContent)
    // })

    console.log(content)
    return NextResponse.json({ content, content2, url })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
