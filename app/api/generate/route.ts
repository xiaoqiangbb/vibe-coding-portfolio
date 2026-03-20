import { NextResponse } from 'next/server';

export const runtime = 'edge';

const VOLCENGINE_API_KEY = process.env.VOLCENGINE_API_KEY;
const VOLCENGINE_IMAGE_MODEL = process.env.VOLCENGINE_IMAGE_MODEL || 'doubao-seedream-5-0-260128';

const sizeMap = {
  "2K": "1024x1792",
  "3K": "1472x1792",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, size = "2K", image } = body;

    if (!VOLCENGINE_API_KEY) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 400 });
    }

    const actualSize = sizeMap[size as keyof typeof sizeMap] || sizeMap["2K"];
    const [width, height] = actualSize.split('x').map(Number);

    // 调用火山引擎 API
    const response = await fetch("https://aquasearch.volcengineapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLCENGINE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VOLCENGINE_IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        image: image ? [image] : undefined,
        width,
        height,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("火山API错误:", error);
      return NextResponse.json({ error: `生成失败: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // 火山返回格式: data.choices[0].url
    const imageUrl = data.choices?.[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json({ error: "未返回图片URL" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("生成异常:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
