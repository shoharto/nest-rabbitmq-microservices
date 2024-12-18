# NestJS RabbitMQ Microservices Documentation

## Project Overview
This project demonstrates a microservices architecture using NestJS and RabbitMQ, consisting of two microservices:
- Order Microservice (Port 3000)
- Processing Microservice (Port 3001)

## Getting Started

### Prerequisites
- Node.js (v16+)
- RabbitMQ Server
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Build all services
npm run build

# Start services
npm run start:dev:order     # Terminal 1
npm run start:dev:processing # Terminal 2
```

## Architecture

### Common Library (@app/common)
Located in `libs/common`, this shared library contains:
- DTOs
- Interfaces
- Exception Filters
- Interceptors
- Common Types

### Order Microservice

```1:29:order-microservice/src/app.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateOrderDto } from '@app/common/dto/create-order.dto';
import { Order, OrderStatus } from '@app/common/interfaces/order.interface';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  ServiceUnavailableException,
@ApiTags('Orders')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
    this.client.emit('order_created', order); // Sends message to RabbitMQ
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
```

- Primary service for creating orders
- Publishes events to RabbitMQ
- Swagger API documentation available

### Processing Microservice

```1:26:processing-microservice/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';
import { Order, ProcessedOrder } from '@app/common/interfaces/order.interface';
import { OrderStatus } from '@app/common/interfaces/order.interface';
export class AppController {
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  handleOrderCreated(order: { customerId: string; product: string }): void {
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
  }
  @Get('orders')
  getOrders(): ProcessedOrder[] {
    return this.appService.getOrders();
  }
}
```

- Processes orders received via RabbitMQ
- Maintains processed orders list
- Provides REST endpoint for viewing processed orders

## API Documentation

### Order Microservice (Port 3000)

#### Create Order
- **Endpoint**: POST `/orders`
- **Swagger**: http://localhost:3000/api
- **Example**:
```bash
curl -X POST http://localhost:3000/orders \
-H "Content-Type: application/json" \
-d '{
    "productId": "prod-123",
    "quantity": 2,
    "price": 29.99,
    "customerId": "cust-456"
}'
```

### Processing Microservice (Port 3001)

#### Get Processed Orders
- **Endpoint**: GET `/orders`
- **Swagger**: http://localhost:3001/api
- **Example**:
```bash
curl http://localhost:3001/orders
```

## Configuration

### RabbitMQ Configuration
Both services require RabbitMQ configuration in their respective `.env` files:

```env
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=orders_queue
```

### Swagger Configuration
```env
SWAGGER_TITLE=Order Service
SWAGGER_DESCRIPTION=Order Management API
SWAGGER_VERSION=1.0
PORT=3000
```

## Error Handling
The system implements global exception handling:

```1:40:libs/common/src/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

```


## Logging
Comprehensive logging is implemented via interceptors:

```1:25:libs/common/src/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${method} ${url} ${Date.now() - now}ms`,
        );
```


## Security
Both services implement:
- Helmet for security headers
- Rate limiting
- Validation pipes
- Exception filters

## Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Scripts

```9:20:package.json
    "prebuild": "rm -rf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "NODE_PATH=./dist ts-node -r tsconfig-paths/register src/main.ts",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
```


## API Types
The system uses TypeScript interfaces for type safety:
- Order Interface
- ProcessedOrder Interface
- CreateOrderDto
- OrderStatus Enum

## Monitoring
- Both services expose Swagger documentation at `/api`
- Logging is implemented at multiple levels
- Error tracking via global exception filter

## Production Deployment
For production deployment:
1. Build all services: `npm run build`
2. Set production environment variables
3. Start services using PM2 or similar process manager
4. Ensure RabbitMQ clustering for high availability

## Additional Resources
- NestJS Documentation: https://docs.nestjs.com/
- RabbitMQ Documentation: https://www.rabbitmq.com/documentation.html
- Swagger UI: Available at `/api` on both services
