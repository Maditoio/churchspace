export function parsePageParam(value: string | null | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function getPaginationMeta(totalItems: number, requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const skip = (currentPage - 1) * pageSize;
  const startItem = totalItems === 0 ? 0 : skip + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(skip + pageSize, totalItems);

  return {
    currentPage,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    pageSize,
    skip,
    startItem,
    totalItems,
    totalPages,
  };
}
