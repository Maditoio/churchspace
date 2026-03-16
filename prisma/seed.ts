import { PrismaClient, ListingStatus, ListingType, PropertyType, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load .env so DATABASE_URL is available
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const cities = [
  { city: "Johannesburg", suburb: "Sandton", province: "Gauteng" },
  { city: "Cape Town", suburb: "Rondebosch", province: "Western Cape" },
  { city: "Durban", suburb: "Umhlanga", province: "KwaZulu-Natal" },
  { city: "Pretoria", suburb: "Centurion", province: "Gauteng" },
];

async function main() {
  const now = new Date();
  const paymentExpiry = new Date(now);
  paymentExpiry.setFullYear(paymentExpiry.getFullYear() + 1);

  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@churchspace.co.za";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.SUPER_ADMIN, password: hashedAdminPassword },
    create: {
      email: adminEmail,
      name: "ChurchSpace Admin",
      password: hashedAdminPassword,
      role: Role.SUPER_ADMIN,
      churchName: "ChurchSpace HQ",
      isActive: true,
    },
  });

  const agentSpecs = [
    { name: "Grace Mthembu", email: "grace@newlightchurch.org", churchName: "New Light Church" },
    { name: "Pastor Daniel Ndlovu", email: "daniel@hopeassembly.org", churchName: "Hope Assembly" },
    { name: "Reverend Sarah Jacobs", email: "sarah@faithcity.org", churchName: "Faith City Ministries" },
  ];

  const agents = [];
  for (const spec of agentSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: { role: Role.AGENT },
      create: {
        email: spec.email,
        name: spec.name,
        role: Role.AGENT,
        password: await bcrypt.hash("Password123!", 10),
        churchName: spec.churchName,
        denomination: "Interdenominational",
        whatsapp: "+27710000000",
      },
    });
    agents.push(user);
  }

  const listingTemplates: Array<{ title: string; propertyType: PropertyType; listingType: ListingType[]; featured: boolean }> = [
    { title: "Cathedral Sanctuary with Balcony", propertyType: PropertyType.SANCTUARY, listingType: [ListingType.RENT, ListingType.HIRE], featured: true },
    { title: "Community Hall for Weekend Services", propertyType: PropertyType.HALL, listingType: [ListingType.SHARING], featured: true },
    { title: "Conference Rooms and Prayer Spaces", propertyType: PropertyType.CONFERENCE_ROOM, listingType: [ListingType.RENT], featured: false },
    { title: "Vacant Land Zoned for Worship", propertyType: PropertyType.VACANT_LAND, listingType: [ListingType.SALE], featured: false },
    { title: "Full Premises with Offices", propertyType: PropertyType.FULL_PREMISES, listingType: [ListingType.SALE, ListingType.RENT], featured: true },
    { title: "Outdoor Worship Amphitheatre", propertyType: PropertyType.OUTDOOR_SPACE, listingType: [ListingType.HIRE], featured: false },
    { title: "Modern Sanctuary with Streaming Booth", propertyType: PropertyType.SANCTUARY, listingType: [ListingType.RENT, ListingType.SHARING], featured: false },
  ];

  for (let i = 0; i < listingTemplates.length; i += 1) {
    const item = listingTemplates[i];
    const city = cities[i % cities.length];
    const agent = agents[i % agents.length];
    const slug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${city.city.toLowerCase()}`;

    const listing = await prisma.listing.upsert({
      where: { slug },
      update: {
        status: ListingStatus.ACTIVE,
        isTaken: false,
        takenAt: null,
        paymentStatus: "PAID",
        paymentPaidAt: now,
        paymentExpiresAt: paymentExpiry,
      },
      create: {
        title: item.title,
        slug,
        description:
          "Beautiful church property with generous natural light, excellent acoustics, and flexible availability for faith communities across South Africa.",
        propertyType: item.propertyType,
        listingType: item.listingType,
        status: ListingStatus.ACTIVE,
        address: "123 Hope Street",
        suburb: city.suburb,
        city: city.city,
        province: city.province,
        country: "South Africa",
        congregationSize: 250 + i * 20,
        areaSquareMeters: 500 + i * 60,
        parkingSpaces: 25 + i * 5,
        rentPricePerHour: item.listingType.includes(ListingType.RENT) ? 1200 + i * 150 : null,
        rentPricePerDay: item.listingType.includes(ListingType.RENT) ? 6500 + i * 300 : null,
        salePrice: item.listingType.includes(ListingType.SALE) ? 3500000 + i * 120000 : null,
        availabilityType: "BY_REQUEST",
        equipment: ["microphones", "pa_system", "projector", "mixing_desk"],
        features: ["wheelchair_accessible", "air_conditioning", "kitchen", "wifi"],
        paymentStatus: "PAID",
        paymentPaidAt: now,
        paymentExpiresAt: paymentExpiry,
        isFeatured: item.featured,
        agentId: agent.id,
        images: {
          create: [
            { url: `https://picsum.photos/seed/churchspace-${i + 1}/1200/800`, alt: item.title, isPrimary: true, order: 0 },
            { url: `https://picsum.photos/seed/churchspace-${i + 10}/1200/800`, alt: `${item.title} photo`, isPrimary: false, order: 1 },
          ],
        },
      },
    });

    await prisma.listingPayment.upsert({
      where: { reference: `SEED-${listing.id}` },
      update: {
        amount: 250,
        status: "PAID",
        paidAt: now,
        expiresAt: paymentExpiry,
      },
      create: {
        listingId: listing.id,
        userId: agent.id,
        amount: 250,
        currency: "ZAR",
        status: "PAID",
        provider: "SIMULATED",
        reference: `SEED-${listing.id}`,
        paidAt: now,
        expiresAt: paymentExpiry,
      },
    });
  }

  const activeListings = await prisma.listing.findMany({ take: 4 });
  for (let i = 0; i < activeListings.length; i += 1) {
    await prisma.enquiry.create({
      data: {
        listingId: activeListings[i].id,
        senderName: `Interested Church ${i + 1}`,
        senderEmail: `contact${i + 1}@faithcommunity.org`,
        senderPhone: "+27820000000",
        message: "We are interested in viewing this property and discussing availability.",
      },
    });
  }

  console.log(`Seed complete. Admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
