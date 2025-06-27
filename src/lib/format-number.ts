/**
 * Formats large numbers into readable short format
 * Examples: 1000 -> 1k, 1500 -> 1.5k, 1000000 -> 1M, 2500000 -> 2.5M
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }

  if (num < 1000000000) {
    const millions = num / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }

  const billions = num / 1000000000;
  return billions % 1 === 0 ? `${billions}B` : `${billions.toFixed(1)}B`;
}

/**
 * Formats numbers with commas for display in detailed views
 */
export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString();
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}