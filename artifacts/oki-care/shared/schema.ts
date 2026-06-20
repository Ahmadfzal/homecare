import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  imageUrl: text("image_url"),
});

export const carouselImages = pgTable("carousel_images", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message"),
});

export const testimg = pgTable("testimg", {
  id: serial("id").primaryKey(),
  title: text("title"),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
});

export const storeSettings = pgTable("store_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertCarouselImageSchema = createInsertSchema(carouselImages).omit({ id: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true });

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type CarouselImage = typeof carouselImages.$inferSelect;
export type InsertCarouselImage = z.infer<typeof insertCarouselImageSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type SiteSettings = {
  store_name: string;
  store_logo: string;
  hero_headline: string;
  hero_subtext: string;
  hero_badge: string;
  stat1_value: string; stat1_label: string;
  stat2_value: string; stat2_label: string;
  stat3_value: string; stat3_label: string;
  trust1_title: string; trust1_desc: string;
  trust2_title: string; trust2_desc: string;
  trust3_title: string; trust3_desc: string;
  footer_desc: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_whatsapp: string;
  category_offer_name: string;
  category_offer_headline: string;
  category_offer_desc: string;
  category_care_name: string;
  category_care_headline: string;
  category_care_desc: string;
  copyright: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  store_name: "Oki HomeCare",
  store_logo: "",
  hero_headline: "Perawatan Medis Profesional di Rumah Anda",
  hero_subtext: "Oki HomeCare menghadirkan layanan medis profesional langsung ke kenyamanan rumah Anda — kapan pun Anda butuhkan.",
  hero_badge: "Layanan Aktif 24 Jam",
  stat1_value: "500+", stat1_label: "Pasien Terlayani",
  stat2_value: "10+",  stat2_label: "Tenaga Medis",
  stat3_value: "24/7", stat3_label: "Siap Melayani",
  trust1_title: "Terpercaya & Aman",
  trust1_desc: "Seluruh tenaga medis kami telah terverifikasi dan memiliki sertifikasi resmi.",
  trust2_title: "Pelayanan Sepenuh Hati",
  trust2_desc: "Kami merawat pasien layaknya keluarga sendiri dengan dedikasi tinggi.",
  trust3_title: "Siap 24/7",
  trust3_desc: "Layanan darurat dan konsultasi tersedia kapanpun Anda butuhkan.",
  footer_desc: "Memberikan pelayanan kesehatan terbaik langsung ke rumah Anda dengan tenaga medis profesional dan bersertifikat.",
  contact_phone: "+6285240354224",
  contact_email: "okiwahyudi098@gmail.com",
  contact_address: "Kalideres jakarta Barat",
  contact_whatsapp: "6285240354224",
  category_offer_name: "Penawaran Spesial",
  category_offer_headline: "Booster & Vitamin",
  category_offer_desc: "Tingkatkan imunitas dan energi Anda dengan paket vitamin dan booster pilihan terbaik kami.",
  category_care_name: "Perawatan Khusus",
  category_care_headline: "Perawatan Khusus",
  category_care_desc: "Perawatan medis intensif dan pendampingan profesional untuk pemulihan optimal di rumah.",
  copyright: "Oki HomeCare. All rights reserved.",
};
