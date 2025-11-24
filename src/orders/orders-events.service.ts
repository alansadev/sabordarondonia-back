import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Order } from './entities/order.entity';

interface SseClient {
  res: Response;
}

@Injectable()
export class OrdersEventsService {
  private readonly logger = new Logger(OrdersEventsService.name);

  private cashierClients: SseClient[] = [];
  private dispatcherClients: SseClient[] = [];

  addCashierClient(res: Response) {
    this.logger.log('Novo cliente SSE (cashier) conectado');
    this.cashierClients.push({ res });
    res.on('close', () => {
      this.logger.log('Cliente SSE (cashier) desconectado');
      this.cashierClients = this.cashierClients.filter((c) => c.res !== res);
    });
  }

  addDispatcherClient(res: Response) {
    this.logger.log('Novo cliente SSE (dispatcher) conectado');
    this.dispatcherClients.push({ res });
    res.on('close', () => {
      this.logger.log('Cliente SSE (dispatcher) desconectado');
      this.dispatcherClients = this.dispatcherClients.filter(
        (c) => c.res !== res,
      );
    });
  }

  notifyCashierNewOrder(order: Order) {
    const payload = JSON.stringify({
      type: 'NEW_ORDER',
      order,
    });
    this.logger.debug(
      `Enviando evento NEW_ORDER para ${this.cashierClients.length} caixas`,
    );
    for (const client of this.cashierClients) {
      client.res.write(`data: ${payload}\n\n`);
    }
  }

  notifyDispatcherOrderAvailable(order: Order) {
    const payload = JSON.stringify({
      type: 'ORDER_AVAILABLE',
      order,
    });
    this.logger.debug(
      `Enviando evento ORDER_AVAILABLE para ${this.dispatcherClients.length} entregadores`,
    );
    for (const client of this.dispatcherClients) {
      client.res.write(`data: ${payload}\n\n`);
    }
  }
}
