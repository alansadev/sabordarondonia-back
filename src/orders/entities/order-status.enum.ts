export enum OrderStatusEnum {
  AWAITING_PAYMENT = 'awaiting_payment', // Pedido feito, esperando no caixa
  AWAITING_DISPATCH = 'awaiting_dispatch', // Pago, esperando entrega
  DELIVERED = 'delivered', // Entregue ao cliente
  CANCELLED = 'cancelled', // Pedido cancelado
}
