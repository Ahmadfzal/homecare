import { motion } from "framer-motion";
import { Phone, Check, Info } from "lucide-react";
import { type Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceCardProps {
  service: Service;
  onContact: (service: Service) => void;
  index: number;
}

export function ServiceCard({ service, onContact, index }: ServiceCardProps) {
  const isSpecialOffer = service.category === "special_offer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className={`
        h-full flex flex-col overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        ${isSpecialOffer 
          ? "border-primary/20 bg-gradient-to-b from-white to-blue-50/50" 
          : "border-transparent bg-white shadow-lg hover:border-primary/10"}
      `}>
        {/* Optional Image Area */}
        {service.imageUrl && (
          <div className="h-48 overflow-hidden bg-muted relative group">
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-300" />
            <img 
              src={service.imageUrl} 
              alt={service.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2 mb-2">
            {isSpecialOffer ? (
              <Badge variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Promo Spesial
              </Badge>
            ) : (
              <Badge variant="outline" className="text-primary border-primary/20">
                Perawatan
              </Badge>
            )}
            <span className="font-display font-bold text-lg text-primary">
              {service.price}
            </span>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-foreground line-clamp-2">
            {service.title}
          </CardTitle>
          <CardDescription className="text-base mt-2 line-clamp-3">
            {service.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow space-y-4">
          {service.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <p>{service.notes}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2">
          <Button 
            onClick={() => onContact(service)}
            className={`
              w-full font-semibold h-12 text-base shadow-lg transition-all duration-300
              ${isSpecialOffer 
                ? "bg-accent hover:bg-accent/90 text-white shadow-accent/25 hover:shadow-accent/40" 
                : "bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:shadow-primary/40"}
            `}
          >
            <Phone className="w-4 h-4 mr-2" />
            Hubungi Kami
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
