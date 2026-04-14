import { AvailabilityType, ListingType, PromotionType, PropertyType } from "@prisma/client";
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  churchName: z.string().min(2),
  denomination: z.string().optional(),
  phone: z.string().min(8),
  whatsapp: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  token: z.string().min(20),
  password: z.string().min(8),
});

export const searchPreferenceSchema = z.object({
  query: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  suburb: z.string().trim().max(80).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.nativeEnum(PropertyType).optional(),
  purpose: z.nativeEnum(ListingType).optional(),
});

export const enquirySchema = z.object({
  listingId: z.string().cuid(),
  senderName: z.string().min(2),
  senderEmail: z.email(),
  senderPhone: z.string().optional(),
  message: z.string().min(12),
});

export const paymentDisputeCreateSchema = z.object({
  subject: z.string().trim().min(5).max(120),
  details: z.string().trim().min(20).max(2000),
});

export const paymentDisputeUpdateSchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "WAITING_FOR_USER", "RESOLVED", "REJECTED"]),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const promotionUpsertSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  type: z.nativeEnum(PromotionType),
  discountValue: z.number().nonnegative(),
  maxUses: z.number().int().positive().optional().nullable(),
  maxFreeListings: z.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const promotionCodeApplySchema = z.object({
  promotionCode: z.string().trim().min(2).max(80),
});

export const listingSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(100),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  propertyType: z.nativeEnum(PropertyType),
  listingType: z.array(z.nativeEnum(ListingType)).min(1),
  address: z.string().min(5),
  suburb: z.string().min(2),
  city: z.string().min(2),
  province: z.string().min(2),
  country: z.string().default("South Africa"),
  congregationSize: z.number().int().positive().optional(),
  areaSquareMeters: z.number().positive().optional(),
  parkingSpaces: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  availabilityType: z.nativeEnum(AvailabilityType).default(AvailabilityType.BY_REQUEST),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  rentPricePerHour: z.number().nonnegative().optional(),
  rentPricePerDay: z.number().nonnegative().optional(),
  rentPricePerMonth: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
  sharingSchedule: z.array(z.object({ day: z.string(), startTime: z.string(), endTime: z.string(), isAvailable: z.boolean() })).optional(),
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      isPrimary: z.boolean().default(false),
      order: z.number().int().nonnegative().default(0),
    }),
  ).default([]),
});

export type ListingInput = z.infer<typeof listingSchema>;
export type PaymentDisputeCreateInput = z.infer<typeof paymentDisputeCreateSchema>;
export type PaymentDisputeUpdateInput = z.infer<typeof paymentDisputeUpdateSchema>;
export type PromotionUpsertInput = z.infer<typeof promotionUpsertSchema>;
