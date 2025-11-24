import { Order } from 'src/orders/entities/order.entity';

export class EventsGateway {
  notifyCashierNewOrder(order: Order) {
    // TODO: implementar envio real (ex: via WebSocket, fila, etc.)
    console.log('[EventsGateway] notifyCashierNewOrder', order.id ?? order);
  }

  notifyDispatcherNewOrder(order: Order) {
    console.log('[EventsGateway] notifyDispatcherNewOrder', order.id ?? order);
  }
}
