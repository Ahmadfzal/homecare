import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Service = {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
};

export default function ImageSlider() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/testimg")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data.filter((item: Service) => item.imageUrl));
        } else if (Array.isArray(data.data)) {
          setServices(data.data.filter((item: Service) => item.imageUrl));
        }
      });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        loop
        className="rounded-2xl overflow-hidden shadow-lg"
      >
        {services.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full aspect-[3/4]">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (item.imageUrl.startsWith('https://object-storage.replit.app/')) {
                    target.src = item.imageUrl.replace('https://object-storage.replit.app/', '/api/image/');
                  }
                }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white max-w-xl">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {item.title}
                  </h2>

                  {item.description && (
                    <p className="text-sm md:text-base mt-2 opacity-90">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
