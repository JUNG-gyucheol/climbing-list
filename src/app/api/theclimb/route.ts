

import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server'
import path from 'path';

export async function GET() {
    try {
    const fileName = `the_climb.json`;
    const dirPath = path.join(process.cwd(), 'public', 'json');
    const filePath = path.join(dirPath, fileName);
    const fileContent = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    console.log("asdsadad",data)
    return NextResponse.json({ data, });

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
