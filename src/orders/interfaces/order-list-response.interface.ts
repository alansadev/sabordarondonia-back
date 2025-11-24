import { PaymentMethod } from 'src/orders/entities/payment-method.enum';

export interface IOrderListResponse {
  id: string;
  order_number: number;
  status: string;
  total_amount: number;
  created_at: Date;
  client: { id: string; name: string };
  seller?: { id: string; name: string };
  cashier?: { id: string; name: string };
  dispatcher?: { id: string; name: string };
  payment_method?: PaymentMethod;
  change_for?: number;
  items: {
    id: string;
    quantity: number;
    product: { id: string; name: string };
  }[];
}
