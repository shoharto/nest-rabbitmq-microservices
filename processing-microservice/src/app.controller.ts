import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';
import { Order, ProcessedOrder } from '@app/common/interfaces/order.interface';
import { OrderStatus } from '@app/common/interfaces/order.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('order_created')
  handleOrderCreated(order: Order) {
    // Ensure all required properties are present
    const completeOrder: Order = {
      ...order,
      status: OrderStatus.PROCESSING,
      createdAt: new Date().toISOString(),
    };
    this.appService.processOrder(completeOrder);
  }

  @Get('orders')
  getOrders(): ProcessedOrder[] {
    return this.appService.getOrders();
  }
}
