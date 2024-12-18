import { Injectable, Logger } from '@nestjs/common';
import { ProcessedOrder, Order } from '@app/common/interfaces/order.interface';
import { OrderProcessingException } from '@app/common/exceptions/service.exceptions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly orders: ProcessedOrder[] = [];

  constructor(private configService: ConfigService) {}

  getOrders(): ProcessedOrder[] {
    try {
      return this.orders;
    } catch (error) {
      this.logger.error(`Failed to get orders: ${error.message}`);
      throw new OrderProcessingException('Failed to retrieve orders');
    }
  }

  processOrder(order: Order): void {
    if (!order || !order.id) {
      throw new OrderProcessingException('Invalid order data');
    }

    try {
      const processedOrder: ProcessedOrder = {
        ...order,
        processedAt: new Date().toISOString(),
      };
      this.orders.push(processedOrder);
      this.logger.log(`Order processed successfully: ${JSON.stringify(processedOrder)}`);
    } catch (error) {
      this.logger.error(`Failed to process order: ${error.message}`);
      throw new OrderProcessingException('Failed to process order');
    }
  }
}
