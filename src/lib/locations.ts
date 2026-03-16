import { slugify } from "@/lib/utils";

/** All featured African countries and their major cities used for landing pages. */
export const AFRICA_LOCATIONS: Record<string, string[]> = {
  "South Africa": [
    "Johannesburg",
    "Cape Town",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Kimberley",
    "Polokwane",
    "Nelspruit",
  ],
  Nigeria: [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Ibadan",
    "Kano",
    "Benin City",
    "Enugu",
    "Onitsha",
    "Warri",
    "Jos",
  ],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri"],
  Ghana: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Sunyani"],
  Zimbabwe: ["Harare", "Bulawayo", "Mutare", "Gweru", "Kadoma"],
  Uganda: ["Kampala", "Entebbe", "Gulu", "Mbarara", "Jinja"],
  Tanzania: ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar"],
  Ethiopia: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa"],
  Zambia: ["Lusaka", "Ndola", "Kitwe", "Livingstone", "Kabwe"],
  Rwanda: ["Kigali", "Butare", "Gisenyi", "Musanze"],
  Cameroon: ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua"],
  Angola: ["Luanda", "Huambo", "Lobito", "Lubango", "Benguela"],
  Mozambique: ["Maputo", "Beira", "Nampula", "Quelimane", "Tete"],
  Malawi: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"],
  Botswana: ["Gaborone", "Francistown", "Maun", "Mahalapye"],
  Namibia: ["Windhoek", "Swakopmund", "Walvis Bay", "Rundu", "Oshakati"],
  Eswatini: ["Mbabane", "Manzini", "Lobamba"],
  Lesotho: ["Maseru", "Teyateyaneng", "Mafeteng"],
  Congo: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani"],
  Senegal: ["Dakar", "Thiès", "Kaolack", "Ziguinchor"],
};

/** Sorted list of featured countries (most established markets first). */
export const FEATURED_COUNTRIES = ["South Africa", "Nigeria", "Kenya", "Ghana", "Zimbabwe", "Uganda", "Tanzania", "Ethiopia", "Zambia", "Rwanda"];

/** Convert a URL slug back to a display label: "south-africa" → "South Africa". */
export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Build a stable static params list for Next.js generateStaticParams. */
export function allCountryParams() {
  return Object.keys(AFRICA_LOCATIONS).map((country) => ({ country: slugify(country) }));
}

export function allCityParams() {
  return Object.entries(AFRICA_LOCATIONS).flatMap(([country, cities]) =>
    cities.map((city) => ({ country: slugify(country), city: slugify(city) })),
  );
}
