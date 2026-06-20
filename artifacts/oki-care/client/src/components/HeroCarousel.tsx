import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { type CarouselImage, type SiteSettings, DEFAULT_SETTINGS } from "@shared/schema";
import { Button } from "./ui/button";
import { ChevronRight, PhoneCall } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface HeroCarouselProps {
  images: CarouselImage[];
  settings: SiteSettings;
  onContactClick: () => void;
}

export function HeroCarousel({ images, settings, onContactClick }: HeroCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const s = settings ?? DEFAULT_SETTINGS;

  const defaultImages = [
    {
      id: 999,
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070",
      caption: s.hero_headline,
    },
    {
      id: 998,
      imageUrl: "https://images.unsplash.com/photo-1584515933487-9d3005c010aa?auto=format&fit=crop&q=80&w=2070",
      caption: "Layanan Kesehatan Terpercaya 24 Jam",
    },
    {
      id: 997,
      imageUrl: "https://images.unsplash.com/photo-1516574187841-69301976e499?auto=format&fit=crop&q=80&w=2070",
      caption: "Tim Medis Berpengalaman & Bersertifikat",
    },
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  const waLink = `https://wa.me/${s.contact_whatsapp}?text=Halo%20Admin,%20saya%20ingin%20bertanya`;

  return (
    <div className="relative w-full h-[620px] md:h-[720px] overflow-hidden bg-[#001a5c]">
      <div className="embla w-full h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {displayImages.map((image) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative h-full" key={image.id}>
              <div className="absolute inset-0">
                <img
                  src={image.imageUrl}
                  alt={image.caption || "Hero image"}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#001a5c] via-[#001a5c]/70 to-[#001a5c]/20" />
              </div>

              <div className="relative h-full flex items-center container mx-auto px-6 md:px-10 lg:px-16">
                <div className="max-w-2xl space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/90 text-sm font-medium">{s.hero_badge}</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] text-shadow-lg">
                    {image.caption || s.hero_headline}
                  </h1>

                  <p className="text-lg md:text-xl text-blue-100/80 max-w-lg leading-relaxed">
                    {s.hero_subtext}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button
                      onClick={onContactClick}
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-8 py-6 h-auto rounded-full shadow-lg shadow-orange-900/30 hover:scale-105 transition-all duration-200"
                    >
                      <PhoneCall className="w-5 h-5 mr-2" />
                      Pesan Sekarang
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm font-semibold text-base px-8 py-6 h-auto rounded-full transition-all duration-200"
                      onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Lihat Layanan
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="text-white">
                      <span className="text-2xl font-bold font-display">{s.stat1_value}</span>
                      <span className="block text-white/60 text-sm">{s.stat1_label}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-white">
                      <span className="text-2xl font-bold font-display">{s.stat2_value}</span>
                      <span className="block text-white/60 text-sm">{s.stat2_label}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-white">
                      <span className="text-2xl font-bold font-display">{s.stat3_value}</span>
                      <span className="block text-white/60 text-sm">{s.stat3_label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp floating button */}
      <div className="absolute bottom-8 right-8 z-10">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
        >
          <FaWhatsapp className="w-5 h-5" />
          <span className="hidden sm:inline">Chat WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
