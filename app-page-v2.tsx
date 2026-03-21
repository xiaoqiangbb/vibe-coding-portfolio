"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Download, Heart, Trash2, Loader2, X, Upload } from "lucide-react";

// 定义图片数据结构
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  favorite: boolean;
}

// 新 API 里 size 只能是 2K 或 3K
type Size = "2K" | "3K";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [size, setSize] = useState<Size>("2K");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);

  // 从 localStorage 加载图片
  useEffect(() => {
    const saved = localStorage.getItem("ai-gallery-images");
    if (saved) {
      setImages(JSON.parse(saved));
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("ai-gallery-images", JSON.stringify(images));
  }, [images]);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputImage(file);
      setInputImageUrl(URL.createObjectURL(file));
    }
  };

  // 清除输入图片
  const clearInputImage = () => {
    if (inputImageUrl) {
      URL.revokeObjectURL(inputImageUrl);
    }
    setInputImage(null);
    setInputImageUrl(null);
  };

  // 生成图片
  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !inputImage) {
      alert("请输入提示词，或者上传参考图");
      return;
    }

    setIsGenerating(true);
    try {
      const body: Record<string, unknown> = { prompt: prompt.trim(), size };
      
      // 如果有输入图片，转成 base64 传给后端
      if (inputImage) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(inputImage);
        });
        body.image = base64;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.url,
        prompt: prompt.trim(),
        createdAt: Date.now(),
        favorite: false,
      };

      setImages([newImage, ...images]);
      setPrompt("");
      clearInputImage();
    } catch (error) {
      console.error("生成失败:", error);
      alert(`生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 切换收藏
  const toggleFavorite = (id: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, favorite: !img.favorite } : img
    ));
  };

  // 删除图片
  const deleteImage = (id: string) => {
    if (confirm("确定要删除这张图片吗？")) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  // 下载图片 - 直接下载，GitHub Pages 兼容
  const downloadImage = async (image: GeneratedImage) => {
    try {
      // 直接获取图片并blob下载，绕过跨域
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败，可能是跨域限制，请右键图片 -> 图片另存为");
    }
  };

  // 过滤显示的图片
  const displayedImages = showFavoritesOnly 
    ? images.filter(img => img.favorite) 
    : images;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI 画廊 🎨
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                文生图 / 图生图，收藏你喜欢的 AI 作品
              </p>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all ${
                showFavoritesOnly
                  ? "bg-pink-500 border-pink-500 text-white"
                  : "bg-white/5 border-white/20 text-gray-200 hover:bg-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
              <span className="text-sm sm:text-base">{showFavoritesOnly ? "显示全部" : "只看收藏"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Generate Form */}
        <section className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={generateImage} className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-xl">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              生成新图片
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的图片，比如：一只可爱的猫咪在云端看书，水彩风格..."
                className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base"
              />

              {/* 参考图预览 */}
              {inputImageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-white/20">
                  <Image
                    src={inputImageUrl}
                    alt="输入图片"
                    width={200}
                    height={200}
                    className="w-full max-h-48 object-contain bg-black/30"
                  />
                  <button
                    onClick={clearInputImage}
                    className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 rounded-full w-8 h-8 flex items-center justify-center text-white"
                    title="清除图片"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="absolute bottom-0 left-0 w-full bg-black/70 text-gray-200 text-xs text-center py-1">
                    参考图（图生图）
                  </p>
                </div>
              )}

              {/* 图片上传 */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <Upload className="w-4 h-4" />
                  <span>添加参考图（可选，用于图生图）</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-gray-200 file:text-sm file:bg-white/10 file:text-gray-200 cursor-pointer"
                  />
                </label>
              </div>

              {/* Size selector */}
              <div className="flex gap-4 items-center">
                <span className="text-gray-300 text-sm">图片尺寸:</span>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size"
                    value="2K"
                    checked={size === "2K"}
                    onChange={() => setSize("2K")}
                    className="accent-purple-500"
                  />
                  <span className="text-gray-200 text-sm">2K</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="size"
                    value="3K"
                    checked={size === "3K"}
                    onChange={() => setSize("3K")}
                    className="accent-purple-500"
                  />
                  <span className="text-gray-200 text-sm">3K</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!prompt.trim() && !inputImage)}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    开始生成
                  </span>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Image Gallery */}
        <section>
          {displayedImages.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 mx-auto text-gray-400 opacity-50 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {images.length === 0 ? "还没有图片" : "没有收藏的图片"}
              </h3>
              <p className="text-gray-400 text-lg">
                {images.length === 0 
                  ? "输入第一个提示词，开始生成吧！" 
                  : "去收藏几张喜欢的图片吧"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayedImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(image.id)}
                          className={`p-2 rounded-full backdrop-blur-md transition-all ${
                            image.favorite
                              ? "bg-pink-500 text-white"
                              : "bg-black/50 text-white hover:bg-black/70"
                          }`}
                          title={image.favorite ? "取消收藏" : "收藏"}
                        >
                          <Heart className={`w-4 h-4 ${image.favorite ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => downloadImage(image)}
                          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-all"
                          title="下载"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="p-2 rounded-full bg-black/50 text-red-400 hover:bg-red-500 hover:text-white backdrop-blur-md transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Prompt */}
                  <div className="p-4">
                    <p className="text-gray-200 text-sm line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(image.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-white/10">
        <p className="text-center text-gray-400 text-sm">
          AI 画廊 • 你的个人 AI 图片收藏馆
        </p>
      </footer>
    </div>
  );
}
