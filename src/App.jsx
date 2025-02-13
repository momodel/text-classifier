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
import course1 from '@/assets/course1.png';
import course2 from '@/assets/course2.png';
import course3 from '@/assets/course3.png';
import course4 from '@/assets/course4.png';
import course5 from '@/assets/course5.png';
import course6 from '@/assets/course6.png';
import appBanner from '@/assets/app_banner.png';
import appBannerMobile from '@/assets/app_banner_mobile.png';
import coursesTitle from '@/assets/courses_title.png';
import coursesTitleMobile from '@/assets/courses_title_mobile.png';
import appBannerTitle from '@/assets/app_banner_title.png';
import appBannerTitleMobile from '@/assets/app_banner_title_mobile.png';
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

const COURSE_DATA = [
  {
    image: course1,
    link: "https://momodel.cn/aiNewFirstClass"
  },
  {
    image: course2,
    link: "https://momodel.cn/classroom/course/detail?id=60f02c635076ff487bce4c6f&activeKey=info"
  },
  {
    image: course3,
    link: "https://momodel.cn/classroom/course/detail?id=6173911eab37f12b14daf4a8&activeKey=info"
  },
  {
    image: course4,
    link: "https://momodel.cn/classroom/class/6711e88cc5eb5536a3e4e383?activeKey=intro"
  },
  {
    image: course5,
    link: "https://momodel.cn/classroom/class/658e2e7b891ad518e0274bd7?activeKey=intro"
  },
  {
    image: course6,
    link: "https://media.momodel.cn/article/%e7%8c%ab%e7%8b%97%e5%a4%a7%e6%88%98%ef%bc%9a%e4%bd%bf%e7%94%a8cnn%e5%bf%ab%e9%80%9f%e8%af%86%e5%88%ab%e5%ae%a0%e7%89%a9/1870/latest-articles"
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
          className={`flex-1 ${!isMobile && 'transition-all duration-300 hover:-translate-y-1'}`}
          onClick={() => handlePlatformClick("https://momodel.cn")}
        >
          <img 
            src={isMobile ? moMobile : moPc}
            alt="Mo平台" 
            className="w-full h-auto rounded-lg shadow-[10px_10px_10px_0px_rgba(138,207,254,0.10)]"
          />
        </a>

        <a 
          href={appendUrlParams("https://app.momodel.cn", { src: "zjsr" })}
          target="_blank" 
          className={`flex-1 ${!isMobile && 'transition-all duration-300 hover:-translate-y-1'}`}
          onClick={() => handlePlatformClick("https://app.momodel.cn")}
        >
          <img 
            src={isMobile ? moAppMobile : moAppPc}
            alt="Mo卡片" 
            className="w-full h-auto rounded-lg shadow-[10px_10px_10px_0px_rgba(138,159,254,0.10)]"
          />
        </a>
      </div>

      {/* 分类器主体 */}
      <div className={`relative ${isMobile ? 'px-3 mb-4' : 'mb-8'}`}>
        <TextClassifier />
      </div>

      {/* Baby App 轮播 */}
      <div className={`relative mx-auto ${isMobile ? 'px-3 mb-16' : 'max-w-4xl mb-20'}`}>
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

      {/* 课程图片 */}
      <div className="relative mx-auto max-w-4xl mb-20 px-3">
        {/* 修改课程标题为可点击，添加移动端判断 */}
        <div className="mb-10">
          <a href={appendUrlParams("https://momodel.cn/classroom", { src: "zjsr" })} target="_blank">
            <img 
              src={isMobile ? coursesTitleMobile : coursesTitle} 
              alt="Courses Title" 
              className="w-full h-auto mx-auto" 
            />
          </a>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-3 gap-10'}`}>
          {COURSE_DATA.map((course, index) => (
            <a key={index} href={appendUrlParams(course.link, { src: "zjsr" })} target="_blank">
              <img 
                src={course.image} 
                alt={`Course ${index + 1}`} 
                className="w-full h-auto rounded-lg shadow" 
              />
            </a>
          ))}
        </div>
      </div>

      {/* App Banner */}
      <div className="relative mx-auto max-w-4xl mb-20 px-3">
        {/* 修改 App Banner 标题为可点击，添加移动端判断 */}
        <div className="mb-10">
          <a href={appendUrlParams("https://app.momodel.cn", { src: "zjsr" })} target="_blank">
            <img 
              src={isMobile ? appBannerTitleMobile : appBannerTitle} 
              alt="App Banner Title" 
              className="w-full h-auto mx-auto" 
            />
          </a>
        </div>
        <a href={appendUrlParams("https://app.momodel.cn", { src: "zjsr" })} target="_blank">
          <img 
            src={isMobile ? appBannerMobile : appBanner} 
            alt="App Banner" 
            className="w-full h-auto" 
          />
        </a>
      </div>
    </div>
  );
}

export default App;
