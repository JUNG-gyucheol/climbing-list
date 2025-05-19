import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'
import { the_climbs } from '@/utils/climbs'
import { supabase } from '@/client/client'

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )

    const times = []
    for (const theClimb of the_climbs) {
      await page.goto(`https://map.naver.com/p/search/더클라임${theClimb.ko}`)
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const searchFrame = await page.$('#searchIframe')
      const frame = await searchFrame?.contentFrame()

      if (frame) {
        await frame.evaluate(async (theClimb) => {
          const content = document.querySelectorAll('ul span')
          for (const span of content) {
            if (span.textContent?.includes(theClimb.ko)) {
              ;(span as HTMLElement).click()
              return
            }
          }
        }, theClimb)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        const url = page.url()
        console.log(url)

        await page.goto(url)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      const EntryIFrame = await page.$('#entryIframe')
      const entryFrame = await EntryIFrame?.contentFrame()

      if (!entryFrame) {
        throw new Error('entryFrame not found')
      }
      const climbingContent = await entryFrame.evaluate(async () => {
        const content = document.querySelectorAll('em')
        const address = document.querySelectorAll(
          'div[class="place_section_content"] a',
        )
        console.log((address[0] as HTMLElement).innerText)
        content[0].click()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const parentElement =
          content[0].parentElement?.parentElement?.parentElement
        const firstClass = parentElement?.classList[0]
        const children = document.querySelectorAll(`div[class="${firstClass}"]`)
        return {
          address: (address[0] as HTMLElement).innerText,
          business_hours: Array.from(children).map((item) =>
            (item as HTMLElement).innerText.split('\n').splice(0, 2),
          ),
        }
      })

      await supabase
        .from('climbing_branch')
        .update({
          address: climbingContent.address,
        })
        .eq('branch', theClimb.ko)
      times.push(climbingContent)
    }
    // await new Promise((resolve) => setTimeout(resolve, 3000))
    // await page.evaluate(() => {
    //   const content = document.querySelectorAll('span')
    //   return Array.from(content).map((item) => item.textContent)
    // })

    // console.log(content)
    await browser.close()
    return NextResponse.json({ times })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
