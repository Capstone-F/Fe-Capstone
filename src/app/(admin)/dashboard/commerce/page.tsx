import { CommerceWalletView } from "@/features/admin/components/commerce-wallet-view";

interface AdminCommercePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminCommercePage({
  searchParams,
}: AdminCommercePageProps) {
  const params = await searchParams;
  const userId = first(params.userId);
  const initialCustomer = userId
    ? {
        id: userId,
        name: first(params.name) || "Demo Customer",
        email: first(params.email),
      }
    : undefined;

  return <CommerceWalletView initialCustomer={initialCustomer} />;
}
