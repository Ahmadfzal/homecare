import { useState } from "react";
import { useServices, useCarouselImages, useSettings } from "@/hooks/use-homecare";
import { type Service, DEFAULT_SETTINGS } from "@shared/schema";
import { ContactDialog } from "@/components/ContactDialog";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneCall, ShieldCheck, HeartPulse, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ImageSlider from "@/components/ImageSlider";

export default function Home() {
  const { data: services, isLoading: isServicesLoading } = useServices();
  const { data: carouselImages, isLoading: isImagesLoading } = useCarouselImages();
  const { data: settings } = useSettings();

  const s = settings ?? DEFAULT_SETTINGS;

  const [contactOpen, setContactOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleContact = (service?: Service) => {
    setSelectedService(service || null);
    setContactOpen(true);
  };

  const specialOffers = services?.filter((sv) => sv.category === "special_offer") || [];
  const specialCare = services?.filter((sv) => sv.category === "special_care") || [];

  if (isServicesLoading || isImagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Memuat {s.store_name}...</p>
        </div>
      </div>
    );
  }

  const waLink = `https://wa.me/${s.contact_whatsapp}?text=Halo%20Admin,%20saya%20ingin%20bertanya`;

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-6 px-4 md:px-8 border-b border-white/10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {s.store_logo ? (
              <img src={s.store_logo} alt={s.store_name} className="w-10 h-10 rounded-lg object-contain bg-white/10" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-display font-bold text-white tracking-tight text-shadow">
              {s.store_name.includes("HomeCare") ? (
                <>
                  {s.store_name.replace("HomeCare", "")}<span className="text-accent">HomeCare</span>
                </>
              ) : (
                s.store_name
              )}
            </span>
          </div>
          <Button
            onClick={() => window.open(waLink, "_blank")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg transition-all hover:scale-105 flex items-center justify-center px-3 py-2 rounded-lg max-w-full"
          >
            <FaWhatsapp className="w-5 h-5 mr-2" />
            <span className="inline sm:inline">WhatsApp</span>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <HeroCarousel images={carouselImages || []} settings={s} onContactClick={() => handleContact()} />

      {/* Trust Indicators */}
      <section className="py-12 bg-white relative z-10 -mt-10 mx-4 md:mx-8 lg:mx-auto max-w-7xl rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 px-8 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{s.trust1_title}</h3>
            <p className="text-muted-foreground text-sm">{s.trust1_desc}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-primary">
            <HeartPulse className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{s.trust2_title}</h3>
            <p className="text-muted-foreground text-sm">{s.trust2_desc}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-primary">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{s.trust3_title}</h3>
            <p className="text-muted-foreground text-sm">{s.trust3_desc}</p>
          </div>
        </div>
      </section>

      {/* Image Slider */}
      <section className="py-16 bg-slate-50 container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Galeri</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Layanan Kami dalam Gambar</h2>
        </div>
        <ImageSlider />
      </section>

      {/* Services */}
      <div id="services" className="py-24 space-y-24">

        {/* Special Offers */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent font-bold tracking-wider uppercase text-sm mb-2 block">{s.category_offer_name}</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">{s.category_offer_headline}</h2>
            <p className="text-lg text-muted-foreground">{s.category_offer_desc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialOffers.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} onContact={handleContact} />
            ))}
            {specialOffers.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50 rounded-2xl border border-dashed">
                Belum ada penawaran spesial saat ini.
              </div>
            )}
          </div>
        </section>

        {/* Special Care */}
        <section className="bg-slate-50 py-24 border-y border-slate-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">{s.category_care_name}</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">{s.category_care_headline}</h2>
              <p className="text-lg text-muted-foreground">{s.category_care_desc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialCare.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} onContact={handleContact} />
              ))}
              {specialCare.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                  Layanan perawatan khusus akan segera tersedia.
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {s.store_logo ? (
                <img src={s.store_logo} alt={s.store_name} className="w-8 h-8 rounded object-contain bg-white/10" />
              ) : (
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-display font-bold text-white">
                {s.store_name.includes("HomeCare") ? (
                  <>{s.store_name.replace("HomeCare", "")}<span className="text-accent">HomeCare</span></>
                ) : s.store_name}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{s.footer_desc}</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Kontak Kami</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-primary" />
                <span>{s.contact_phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center text-primary font-bold">@</span>
                <span>{s.contact_email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Alamat</h4>
            <p className="text-sm text-slate-400">{s.contact_address}</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {s.copyright}
        </div>
      </footer>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} selectedService={selectedService} />
    </div>
  );
}
