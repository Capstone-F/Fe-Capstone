import { Product, ProductCategory } from "@/types/domain";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Mask",
];

export const SKIN_TYPES = [
  "Da dầu",
  "Da khô",
  "Da hỗn hợp",
  "Da thường",
  "Da nhạy cảm",
];

export const SKIN_CONCERNS = [
  "Mụn",
  "Thâm",
  "Lão hóa",
  "Lỗ chân lông",
  "Xỉn màu",
];

/**
 * Ingredient-conflict matrix (mirrors business rule 03/08).
 * Slugs must match Product.ingredients entries.
 */
export const INGREDIENT_CONFLICTS: {
  a: string;
  b: string;
  reason: string;
}[] = [
  {
    a: "retinol",
    b: "aha",
    reason:
      "Retinol dùng chung với AHA có thể gây kích ứng và bong tróc mạnh. Nên dùng ở hai buổi khác nhau.",
  },
  {
    a: "retinol",
    b: "bha",
    reason:
      "Retinol dùng chung với BHA có thể gây kích ứng và bong tróc mạnh. Nên dùng ở hai buổi khác nhau.",
  },
  {
    a: "vitamin_c",
    b: "niacinamide",
    reason:
      "Vitamin C và Niacinamide ở một số công thức có thể làm giảm hiệu quả của nhau.",
  },
];

export const PRODUCT_BRANDS = [
  "La Roche-Posay",
  "CeraVe",
  "The Ordinary",
  "Paula's Choice",
  "Some By Mi",
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Serum Retinol 0.3% + Squalane",
    brand: "The Ordinary",
    category: "Serum",
    priceVnd: 320000,
    images: ["https://placehold.co/600x600/eef3fd/5b8def?text=Retinol"],
    shortDescription: "Chống lão hóa, làm mờ nếp nhăn ban đêm.",
    description:
      "Serum Retinol nồng độ 0.3% kết hợp Squalane làm dịu, hỗ trợ tái tạo da và giảm dấu hiệu lão hóa. Chỉ dùng buổi tối.",
    ingredients: ["retinol", "squalane"],
    activeIngredient: "retinol",
    concentration: "0.3%",
    skinTypes: ["Da thường", "Da hỗn hợp"],
    concerns: ["Lão hóa", "Thâm"],
    goals: ["Chống lão hóa"],
    howToUse:
      "Dùng buổi tối, sau toner. Luôn dùng kem chống nắng vào ban ngày.",
    rating: 4.7,
    reviews: 214,
    stockStatus: "in_stock",
    quantityOnHand: 40,
    matchesUserSkin: true,
    previouslyPurchased: false,
  },
  {
    id: "prod_2",
    name: "Serum Niacinamide 10% + Zinc",
    brand: "The Ordinary",
    category: "Serum",
    priceVnd: 260000,
    images: ["https://placehold.co/600x600/e8f8f1/2bb673?text=Niacinamide"],
    shortDescription: "Kiềm dầu, thu nhỏ lỗ chân lông.",
    description:
      "Niacinamide 10% kết hợp Zinc PCA giúp kiểm soát bã nhờn, làm đều màu da và giảm mụn. Dùng được sáng và tối.",
    ingredients: ["niacinamide", "zinc"],
    activeIngredient: "niacinamide",
    concentration: "10%",
    skinTypes: ["Da dầu", "Da hỗn hợp"],
    concerns: ["Mụn", "Lỗ chân lông"],
    goals: ["Giảm mụn", "Kiềm dầu"],
    howToUse: "Dùng sáng và tối sau bước làm sạch.",
    rating: 4.8,
    reviews: 512,
    stockStatus: "in_stock",
    quantityOnHand: 120,
    matchesUserSkin: true,
    previouslyPurchased: true,
  },
  {
    id: "prod_3",
    name: "Tẩy tế bào chết BHA 2%",
    brand: "Paula's Choice",
    category: "Toner",
    priceVnd: 690000,
    images: ["https://placehold.co/600x600/fef3c7/f59e0b?text=BHA+2%25"],
    shortDescription: "Làm sạch sâu lỗ chân lông, giảm mụn ẩn.",
    description:
      "Dung dịch BHA (Salicylic Acid) 2% giúp làm sạch sâu, giảm mụn đầu đen và mụn ẩn. Dùng cách buổi với retinol.",
    ingredients: ["bha"],
    activeIngredient: "bha",
    concentration: "2%",
    skinTypes: ["Da dầu", "Da hỗn hợp"],
    concerns: ["Mụn", "Lỗ chân lông"],
    goals: ["Giảm mụn"],
    howToUse:
      "Dùng 3-4 lần/tuần vào buổi tối. Không dùng chung buổi với retinol.",
    rating: 4.9,
    reviews: 803,
    stockStatus: "low_stock",
    quantityOnHand: 6,
    matchesUserSkin: false,
    previouslyPurchased: false,
  },
  {
    id: "prod_4",
    name: "Serum Vitamin C 15%",
    brand: "La Roche-Posay",
    category: "Serum",
    priceVnd: 780000,
    images: ["https://placehold.co/600x600/feede8/ef4444?text=Vitamin+C"],
    shortDescription: "Làm sáng, chống oxy hóa ban ngày.",
    description:
      "Serum Vitamin C 15% chống oxy hóa, làm sáng da và mờ thâm. Dùng buổi sáng trước kem chống nắng.",
    ingredients: ["vitamin_c"],
    activeIngredient: "vitamin_c",
    concentration: "15%",
    skinTypes: ["Da thường", "Da khô"],
    concerns: ["Thâm", "Xỉn màu"],
    goals: ["Làm sáng"],
    howToUse: "Dùng buổi sáng, trước kem chống nắng.",
    rating: 4.6,
    reviews: 189,
    stockStatus: "in_stock",
    quantityOnHand: 33,
    matchesUserSkin: false,
    previouslyPurchased: false,
  },
  {
    id: "prod_5",
    name: "Sữa rửa mặt dịu nhẹ",
    brand: "CeraVe",
    category: "Cleanser",
    priceVnd: 290000,
    images: ["https://placehold.co/600x600/eef3fd/5b8def?text=Cleanser"],
    shortDescription: "Làm sạch, giữ ẩm với Ceramide.",
    description:
      "Sữa rửa mặt tạo bọt dịu nhẹ chứa Ceramide và Hyaluronic Acid, làm sạch mà không gây khô căng.",
    ingredients: ["ceramide", "hyaluronic_acid"],
    skinTypes: ["Da thường", "Da khô", "Da nhạy cảm"],
    concerns: [],
    goals: ["Làm sạch"],
    howToUse: "Dùng sáng và tối.",
    rating: 4.8,
    reviews: 640,
    stockStatus: "in_stock",
    quantityOnHand: 88,
    matchesUserSkin: true,
    previouslyPurchased: true,
  },
  {
    id: "prod_6",
    name: "Kem chống nắng SPF50+ PA++++",
    brand: "La Roche-Posay",
    category: "Sunscreen",
    priceVnd: 450000,
    images: ["https://placehold.co/600x600/e8f8f1/2bb673?text=SPF50"],
    shortDescription: "Bảo vệ da phổ rộng, không nhờn rít.",
    description:
      "Kem chống nắng SPF50+ PA++++ kết cấu mỏng nhẹ, bảo vệ da khỏi UVA/UVB, phù hợp dùng hằng ngày.",
    ingredients: ["uv_filter"],
    skinTypes: ["Da dầu", "Da hỗn hợp", "Da thường"],
    concerns: ["Lão hóa"],
    goals: ["Chống nắng"],
    howToUse: "Dùng buổi sáng, bước cuối cùng của chu trình.",
    rating: 4.7,
    reviews: 421,
    stockStatus: "out_of_stock",
    quantityOnHand: 0,
    matchesUserSkin: true,
    previouslyPurchased: false,
  },
  {
    id: "prod_7",
    name: "Toner cấp ẩm Hyaluronic",
    brand: "Some By Mi",
    category: "Toner",
    priceVnd: 240000,
    images: ["https://placehold.co/600x600/eef3fd/5b8def?text=Toner"],
    shortDescription: "Cân bằng và cấp ẩm tức thì.",
    description:
      "Toner chứa Hyaluronic Acid giúp cân bằng độ pH và cấp ẩm, làm dịu da sau bước làm sạch.",
    ingredients: ["hyaluronic_acid"],
    skinTypes: ["Da khô", "Da thường", "Da nhạy cảm"],
    concerns: ["Xỉn màu"],
    goals: ["Cấp ẩm"],
    howToUse: "Dùng sáng và tối sau khi rửa mặt.",
    rating: 4.5,
    reviews: 158,
    stockStatus: "in_stock",
    quantityOnHand: 54,
    matchesUserSkin: false,
    previouslyPurchased: false,
  },
  {
    id: "prod_8",
    name: "Kem dưỡng ẩm phục hồi",
    brand: "CeraVe",
    category: "Moisturizer",
    priceVnd: 350000,
    images: ["https://placehold.co/600x600/e8f8f1/2bb673?text=Moisturizer"],
    shortDescription: "Khóa ẩm, phục hồi hàng rào bảo vệ da.",
    description:
      "Kem dưỡng chứa 3 loại Ceramide thiết yếu và Hyaluronic Acid, phục hồi hàng rào bảo vệ da suốt 24h.",
    ingredients: ["ceramide", "hyaluronic_acid"],
    skinTypes: ["Da khô", "Da thường", "Da nhạy cảm"],
    concerns: [],
    goals: ["Cấp ẩm"],
    howToUse: "Dùng sáng và tối, bước dưỡng ẩm.",
    rating: 4.8,
    reviews: 720,
    stockStatus: "in_stock",
    quantityOnHand: 71,
    matchesUserSkin: true,
    previouslyPurchased: false,
  },
];
