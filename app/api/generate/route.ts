import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface GenerateRequest {
  prompt: string;
  size?: "2K" | "3K";
}

export async function POST(request: Request) {
  try {
    const { prompt, size = "2K" } = await request.json() as GenerateRequest;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "提示词不能为空" }, { status: 400 });
    }

    const apiKey = process.env.VOLCENGINE_API_KEY;
    const modelId = process.env.VOLCENGINE_IMAGE_MODEL || "doubao-seedream-5-0-260128";

    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    // 火山方舟文生图 API 地址
    // 正确的 endpoint 是 https://ark.cn-beijing.volces.com/api/v3/images/generations
    const apiEndpoint = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        prompt,
        size,
        n: 1,
        response_format: "url",
        sequential_image_generation: "disabled",
        watermark: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("火山 API 错误:", error);
      return NextResponse.json({ error: `生成图片失败: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    // 返回图片 URL
    if (data.data && data.data.length > 0) {
      return NextResponse.json({ 
        url: data.data[0].url,
        prompt 
      });
    } else {
      return NextResponse.json({ error: "未返回图片" }, { status: 500 });
    }

  } catch (error) {
    console.error("生成图片异常:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
