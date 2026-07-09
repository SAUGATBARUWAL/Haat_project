import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Hero.css";
import HeroSlide from "./HeroSlide";
import { heroSlides } from "./heroData";

export default function Hero() {
    return (
        <div className="rounded-2xl overflow-hidden">
            <Swiper
                className="hero-swiper"
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000 }}
                loop
                modules={[Navigation, Pagination, Autoplay]}
            >
                {heroSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <HeroSlide slide={slide} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}