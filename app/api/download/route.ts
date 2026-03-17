import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'ai-generated.png';

    if (!url) {
      return NextResponse.json({ error: "缺少 URL" }, { status: 400 });
    }

    // 从火山获取图片
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "获取图片失败" }, { status: imageResponse.status });
    }

    // 获取图片 buffer
    const arrayBuffer = await imageResponse.arrayBuffer();

    // 返回图片给用户下载
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("下载图片异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
