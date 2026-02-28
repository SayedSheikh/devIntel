// lib/queries/campaigns.js
export const campaignKeys = {
  all: () => ["campaigns"],
  list: (filters) => ["campaigns", "list", filters],
  detail: (id) => ["campaigns", "detail", id],
};

export async function fetchCampaigns({
  status = "",
  page = 0,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(`/api/campaigns?${params.toString()}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch campaigns");
  }
  return response.json();
}

export function campaignsQueryOptions(filters = {}) {
  return {
    queryKey: campaignKeys.list(filters),
    queryFn: () => fetchCampaigns(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  };
}
