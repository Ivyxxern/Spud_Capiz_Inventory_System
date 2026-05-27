import type { Product } from '../types';

const STORAGE_BASE = 'http://localhost:8000/storage';

export function getProductImageUrl(product: Pick<Product, 'image_url' | 'image_path'>): string | null {
  if (product.image_url) {
    return product.image_url;
  }
  if (product.image_path) {
    return `${STORAGE_BASE}/${product.image_path}`;
  }
  return null;
}
