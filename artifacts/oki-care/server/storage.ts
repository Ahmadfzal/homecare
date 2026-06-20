import { services, carouselImages, inquiries, storeSettings, DEFAULT_SETTINGS, type Service, type InsertService, type CarouselImage, type InsertCarouselImage, type Inquiry, type InsertInquiry, type SiteSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<void>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  getCarouselImages(): Promise<CarouselImage[]>;
  createCarouselImage(image: InsertCarouselImage): Promise<CarouselImage>;
  deleteCarouselImage(id: number): Promise<void>;
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  deleteInquiry(id: number): Promise<void>;
  getSettings(): Promise<SiteSettings>;
  updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async updateService(id: number, update: Partial<InsertService>): Promise<Service> {
    const [service] = await db.update(services).set(update).where(eq(services.id, id)).returning();
    if (!service) throw new Error("Service not found");
    return service;
  }

  async getCarouselImages(): Promise<CarouselImage[]> {
    return await db.select().from(carouselImages);
  }

  async createCarouselImage(insertImage: InsertCarouselImage): Promise<CarouselImage> {
    const [image] = await db.insert(carouselImages).values(insertImage).returning();
    return image;
  }

  async deleteCarouselImage(id: number): Promise<void> {
    await db.delete(carouselImages).where(eq(carouselImages.id, id));
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async deleteInquiry(id: number): Promise<void> {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  async getSettings(): Promise<SiteSettings> {
    const rows = await db.select().from(storeSettings);
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
  }

  async updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    for (const [key, value] of Object.entries(patch)) {
      await db
        .insert(storeSettings)
        .values({ key, value: String(value) })
        .onConflictDoUpdate({ target: storeSettings.key, set: { value: String(value) } });
    }
    return this.getSettings();
  }
}

export const storage = new DatabaseStorage();
