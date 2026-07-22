export type ExpertDiscoverySelection = {
  provinceCode: number | null;
  provinceName: string | null;
  wardCode: number | null;
  wardName: string | null;
};

export const EXPERT_DISCOVERY_STORAGE_KEY = "glowscan_expert_discovery";

export function hasExpertDiscoverySelection(
  selection: ExpertDiscoverySelection | null,
): selection is {
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
} {
  return Boolean(
    selection &&
    selection.provinceCode &&
    selection.provinceName &&
    selection.wardCode &&
    selection.wardName,
  );
}

export function buildExpertDiscoveryLabel(
  selection: ExpertDiscoverySelection,
): string {
  if (selection.wardName && selection.provinceName) {
    return `${selection.wardName}, ${selection.provinceName}`;
  }

  return selection.provinceName ?? "";
}
