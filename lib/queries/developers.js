// lib/queries/developers.js
// Centralized TanStack Query definitions for developer data
//
// WHY centralize queries here?
// If DeveloperTable, DeveloperCard, and ProfilePage all use the same
// queryKey ['developers'], TanStack Query deduplicates the requests.
// Three components mounting at the same time = ONE network request.
// This is a key scalability feature.

// Query key factory — creates consistent, structured cache keys
// Using a factory function prevents typos like 'developer' vs 'developers'
export const developerKeys = {
  all: () => ["developers"],
  list: (filters) => ["developers", "list", filters],
  // filters: { q, skills, page, source }
  detail: (id) => ["developers", "detail", id],
};

// Fetcher function — calls our API route
// Separated from the query definition so it can be reused
export async function fetchDevelopers({
  q = "",
  skills = [],
  page = 0,
  limit = 20,
  source = "",
} = {}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (source) params.set("source", source);
  params.set("page", String(page));
  params.set("limit", String(limit));

  // Append each skill separately (URLSearchParams handles arrays)
  skills.forEach((s) => params.append("skills", s));

  const response = await fetch(`/api/developers?${params.toString()}`, {
    // No cache: 'no-store' here — TanStack Query manages caching itself
    // Using both would result in double caching and stale data
  });

  if (!response.ok) {
    // Throw an error so TanStack Query's error handling kicks in
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch developers");
  }

  return response.json();
  // Returns: { data: [...], total: 0, page: 0, totalPages: 0 }
}

// The query options object — passed to useQuery() in components
// By defining options here, every component that uses developer list
// gets the same caching behavior automatically
export function developersQueryOptions(filters = {}) {
  return {
    queryKey: developerKeys.list(filters),
    queryFn: () => fetchDevelopers(filters),
    staleTime: 30 * 1000,
    // 30 seconds: data is "fresh" for 30s
    // navigating away and back within 30s = no network request
    placeholderData: (previousData) => previousData,
    // While new filters are loading, show the previous results
    // This prevents the table from going blank during filtering
    // This is the TanStack Query v5 way (replaces keepPreviousData)
  };
}
