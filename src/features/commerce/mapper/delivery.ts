import type {
  DeliveryResponse,
  GhnDistrictDto,
  GhnProvinceDto,
  GhnWardDto,
} from "../api/delivery.api";
import type {
  Delivery,
  DeliveryStatus,
  District,
  Province,
  Ward,
} from "../types/delivery";

export function toProvince(dto: GhnProvinceDto): Province {
  return { id: dto.ProvinceID, name: dto.ProvinceName };
}

export function toDistrict(dto: GhnDistrictDto): District {
  return {
    id: dto.DistrictID,
    name: dto.DistrictName,
    provinceId: dto.ProvinceID,
  };
}

export function toWard(dto: GhnWardDto): Ward {
  return {
    code: dto.WardCode,
    name: dto.WardName,
    districtId: dto.DistrictID,
  };
}

export function toDelivery(dto: DeliveryResponse): Delivery {
  return {
    id: dto.id,
    orderId: dto.orderId,
    status: dto.status as DeliveryStatus,
    providerOrderCode: dto.providerOrderCode,
    shippingFeeVnd: dto.shippingFeeVnd,
    expectedDeliveryTime: dto.expectedDeliveryTime,
    shippedAt: dto.shippedAt,
    deliveredAt: dto.deliveredAt,
    recipientName: dto.recipientName,
    streetAddress: dto.streetAddress,
    // Newest first — the card reads as a reverse-chronological feed.
    statusEvents: [...dto.statusEvents].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    ),
  };
}
