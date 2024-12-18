import { Injectable, Logger } from '@nestjs/common';
import { Order } from '@app/common/interfaces/order.interface';
import { OrderProcessingException } from '@app/common/exceptions/service.exceptions';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    const rabbitmqConfig = this.configService.get('rabbitmq');
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqConfig.url],
        queue: rabbitmqConfig.queue,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async createOrder(order: Order): Promise<void> {
    try {
      this.logger.log(`Creating order: ${JSON.stringify(order)}`);
      await this.client.emit('order_created', order).toPromise();
      this.logger.log(`Order created successfully: ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw new OrderProcessingException('Failed to create order');
    }
  }

  async onApplicationShutdown() {
    await this.client.close();
  }
}
