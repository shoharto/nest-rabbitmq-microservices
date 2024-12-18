export interface Order {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  customerId: string;
  status: OrderStatus;
  createdAt: string;
}

export interface ProcessedOrder extends Order {
  processedAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
