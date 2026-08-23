import { Link } from "react-router-dom";

export default function HeroSlide({ slide }) {
    return (
        <div className="relative h-75 sm:h-[350px] md:h-[400px] lg:h-[400px]">
            
            <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                
                <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 text-center text-white">
                    
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                        {slide.title}
                    </h1>

                    <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl">
                        {slide.subtitle}
                    </p>

                    <Link
                        to={slide.buttonLink}
                        className="
                            inline-block
                            mt-5 sm:mt-7
                            bg-green-600
                            hover:bg-green-700
                            px-5 sm:px-6
                            py-2.5 sm:py-3
                            rounded-lg
                            transition
                        "
                    >
                        {slide.buttonText}
                    </Link>

                </div>
            </div>
        </div>
    );
}



{/*import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

import './Hero.css';

// import required modules
import { Navigation } from 'swiper/modules';

export default function App() {
  return (
    <>
      <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
        <SwiperSlide>Slide 1</SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
        <SwiperSlide>Slide 4</SwiperSlide>
        <SwiperSlide>Slide 5</SwiperSlide>
        <SwiperSlide>Slide 6</SwiperSlide>
        <SwiperSlide>Slide 7</SwiperSlide>
        <SwiperSlide>Slide 8</SwiperSlide>
        <SwiperSlide>Slide 9</SwiperSlide>
      </Swiper>
    </>
  );
}*/}

