import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateOrderDto } from '@app/common/dto/create-order.dto';
import { Order, OrderStatus } from '@app/common/interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<void> {
    const order: Order = {
      id: uuidv4(),
      productId: createOrderDto.productId,
      quantity: createOrderDto.quantity,
      price: createOrderDto.price,
      customerId: createOrderDto.customerId,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    await this.appService.createOrder(order);
  }
}
