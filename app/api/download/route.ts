import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'generated.png';

  if (!url) {
    return NextResponse.json({ error: '缺少url参数' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // 返回图片，设置正确的content-type
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(blob, { headers });
  } catch (error) {
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
