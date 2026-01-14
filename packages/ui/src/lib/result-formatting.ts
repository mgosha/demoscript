/**
 * Result formatting utilities
 */

export function formatCurrency(value: unknown, format?: string): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const currency = format || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function truncateTxHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function buildLink(
  value: string,
  type: string,
  handler: string,
  linkHandlers: Record<string, { address?: string; tx?: string; token?: string }>
): string | null {
  const handlerConfig = linkHandlers[handler];
  if (!handlerConfig) return null;

  let template: string | undefined;
  if (type === 'address' || type === 'token') {
    template = handlerConfig.address || handlerConfig.token;
  } else if (type === 'tx') {
    template = handlerConfig.tx;
  }

  if (!template) return null;

  return template.replace('{value}', value);
}
