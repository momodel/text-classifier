import { useState, useEffect } from 'react';

import "./App.css";
import TextClassifier from "./ArtifactCode";

import moPc from '@/assets/mo_pc.png';
import moAppPc from '@/assets/mo_app_pc.png';
import moMobile from '@/assets/mo_mobile.png';
import moAppMobile from '@/assets/mo_app_mobile.png';
import bg from '@/assets/bg.png';
import bgMobile from '@/assets/bg_mobile.png';
import babyAppPc from '@/assets/baby_app_pc.png';
import babyAppMobile from '@/assets/baby_app_mobile.png';
import titlePc from '@/assets/titile_pc.png';
import titleMobile from '@/assets/titile_mobile.png';
import avatarAppPc from '@/assets/avatar_app_pc.png';
import avatarAppMobile from '@/assets/avatar_app_mobile.png';
import wardrobeAppPc from '@/assets/wardrobe_app_pc.png';
import wardrobeAppMobile from '@/assets/wardrobe_app_mobile.png';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

// URL 参数拼接工具函数
const appendUrlParams = (url, params) => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  return urlObj.toString();
};

// 轮播数据
const CAROUSEL_DATA = [
  {
    id: 1,
    title: "Baby生成器",
    link: "https://momodel.cn/explore/66c5a22ea611758a8f66081f?type=app",
    platform: 'mo',
    image: {
      pc: babyAppPc,
      mobile: babyAppMobile
    }
  },
  {
    id: 2,
    title: "趣味大头贴",
    link: "https://momodel.cn/explore/66cbf49d9eeecf952066089c?type=app",
    platform: 'app',
    image: {
      pc: avatarAppPc,
      mobile: avatarAppMobile
    }
  },
  {
    id: 3,
    title: "AI 小衣橱",
    link: "https://momodel.cn/explore/666137708c7e0096cd7716b6?type=app",
    platform: 'mo',
    image: {
      pc: wardrobeAppPc,
      mobile: wardrobeAppMobile
    }
  }
];

function App() {
  const isMobile = window.innerWidth <= 768;
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // 设置自动轮播
    const autoplayInterval = setInterval(() => {
      api.scrollNext();
    }, 5000); // 每5秒切换一次

    // 清理定时器
    return () => clearInterval(autoplayInterval);
  }, [api]);

  // 页面加载埋点
  useEffect(() => {
    window.dataLayer?.push({
      event: 'zjsr_open'
    });
  }, []);

  // 平台跳转埋点
  const handlePlatformClick = (link) => {
    window.dataLayer?.push({
      event: 'zjsr_go_click',
      custom_key1: link
    });
  };

  // Banner点击埋点
  const handleBannerClick = (link) => {
    window.dataLayer?.push({
      event: 'zjsr_banner_click',
      custom_key1: link
    });
  };

  // 点击轮播点切换
  const handleDotClick = (index) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 背景图片 */}
      <img 
        src={isMobile ? bgMobile : bg} 
        className="absolute top-0 left-0 w-full h-auto object-cover z-0"
        alt=""
      />

      {/* 主标题 */}
      <div className={`relative text-center ${isMobile ? 'pt-4 pb-4 px-5' : 'pt-8 pb-6'}`}>
        <img 
          src={isMobile ? titleMobile : titlePc}
          alt="Mo AI 学习全能助手"
          className={`${isMobile ? 'w-full h-auto mb-4' : 'h-8 mx-auto'}`}
        />
      </div>

      {/* Mo平台入口卡片 */}
      <div className={`relative mx-auto ${
        isMobile 
          ? 'px-3 flex flex-row gap-2 mb-8'
          : 'max-w-4xl mb-8 flex flex-row gap-4'
      }`}>
        <a 
          href={appendUrlParams("https://momodel.cn", { src: "zjsr" })}
          target="_blank" 
          className="flex-1 transition-all duration-300 hover:-translate-y-1"
          onClick={() => handlePlatformClick("https://momodel.cn")}
        >
          <img 
            src={isMobile ? moMobile : moPc}
            alt="Mo平台" 
            className="w-full h-auto rounded-2xl shadow-[10px_10px_10px_0px_rgba(138,207,254,0.10)]"
          />
        </a>

        <a 
          href={appendUrlParams("https://app.momodel.cn", { src: "zjsr" })}
          target="_blank" 
          className="flex-1 transition-all duration-300 hover:-translate-y-1"
          onClick={() => handlePlatformClick("https://app.momodel.cn")}
        >
          <img 
            src={isMobile ? moAppMobile : moAppPc}
            alt="Mo卡片" 
            className="w-full h-auto rounded-2xl shadow-[10px_10px_10px_0px_rgba(138,159,254,0.10)]"
          />
        </a>
      </div>

      {/* 分类器主体 */}
      <div className={`relative ${isMobile ? 'px-3 mb-4' : 'mb-8'}`}>
        <TextClassifier />
      </div>

      {/* Baby App 轮播 */}
      <div className={`relative mx-auto ${isMobile ? 'px-3' : 'max-w-4xl mb-8'}`}>
        <Card className="p-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {CAROUSEL_DATA.map((item) => (
                <CarouselItem key={item.id} className="basis-full">
                  <a 
                    href={item.platform === 'mo' ? appendUrlParams(item.link, { src: "zjsrbanner" }) : appendUrlParams('https://app.momodel.cn', { src: "zjsrbanner" })}
                    target="_blank"
                    onClick={() => handleBannerClick(item.platform === 'mo' ? item.link : 'https://app.momodel.cn')}
                  >
                    <img 
                      src={isMobile ? item.image.mobile : item.image.pc}
                      alt={item.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-center gap-2 mt-4">
            {CAROUSEL_DATA.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  current === index ? 'bg-[#2861FC]' : 'bg-gray-200'
                }`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
