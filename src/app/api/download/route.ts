import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'
import { the_climbs } from '@/utils/climbs'
import fs from 'fs'
import path from 'path'

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

    for (let i = 0; i < the_climbs.length; i++) {
      await page.goto(`https://www.instagram.com/${the_climbs[i].url}/`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      // 컨텐츠 로드를 위해 잠시 대기
      await page.waitForSelector('img', { timeout: 10000 })

      // await page.waitForSelector('img', { timeout: 5000 });
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img')

        return {
          logo: imgElements[0].src,
        }
      })

      const response = await fetch(images.logo)
      const buffer = await response.arrayBuffer()
      const fileName = `${the_climbs[i].name}_logo.png`
      const desktopPath = '/Users/jung/Desktop'
      const filePath = path.join(desktopPath, fileName)
      fs.writeFileSync(filePath, Buffer.from(buffer))
      console.log(`Logo saved to: ${filePath}`)

      if (i + 1 === the_climbs.length) {
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
