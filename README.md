# Order Processing Microservices System

## 1. Problem Statement
Our e-commerce platform needs a scalable order processing system that can:
- Handle high volume of incoming orders
- Process orders asynchronously
- Maintain order status tracking
- Ensure reliable order processing even during system failures

## 2. Use Case Diagram
<img width="1502" alt="Screenshot 2024-12-19 at 17 11 12" src="https://github.com/user-attachments/assets/87d7bdf1-a49d-40d1-bdcf-f5ef83a8bf2d" />


## 3. System Architecture
<img width="1503" alt="Screenshot 2024-12-19 at 17 14 04" src="https://github.com/user-attachments/assets/35604532-f21b-4873-8220-0feae074a098" />


## 4. Sequence Diagram
<img width="1232" alt="Screenshot 2024-12-19 at 17 15 05" src="https://github.com/user-attachments/assets/9f614d33-484b-4975-9fab-711b7d93b512" />


## 5. Technical Stack
- **Backend Framework**: NestJS
- **Message Broker**: RabbitMQ
- **API Documentation**: Swagger
- **Containerization**: Docker
- **Health Monitoring**: @nestjs/terminus

## 6. Project Structure
```
nest-rabbitmq-microservices/
├── libs/
│   └── common/              # Shared code between services
├── order-microservice/      # Order handling service
├── processing-microservice/ # Order processing service
└── docker-compose.yml       # Container orchestration
```

## 7. Key Features
- Asynchronous order processing
- Event-driven architecture
- Health monitoring
- API documentation
- Containerized deployment
- Error handling and retries
- Logging and monitoring

## 8. Getting Started
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the services
docker-compose up
```

## 9. API Documentation
Access Swagger documentation at:
- Order Service: http://localhost:3000/api
- Processing Service: http://localhost:3001/api

### 9.1 Order Service Endpoints
#### Create Order
- **Endpoint**: POST `/orders`
- **Description**: Creates a new order and publishes an `order_created` event.
- **Payload**:
```json
{
  "productId": "string",
  "quantity": "number",
  "price": "number",
  "customerId": "string"
}
```

#### Example Request:
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

### 9.2 Processing Service Endpoints
#### Get Processed Orders
- **Endpoint**: GET `/orders`
- **Description**: Retrieves the list of processed orders.

#### Example Request:
```bash
curl http://localhost:3001/orders
```

## 10. Configuration
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

## 11. Error Handling
The system implements global exception handling with structured error responses and logging:
```typescript
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

    response.status(status).json(errorResponse);
  }
}
```

## 12. Monitoring and Logging
- **Logging**: Comprehensive request/response logging is implemented via interceptors.
- **Monitoring**: Swagger documentation is available for APIs, and health endpoints can be used for service monitoring.

## 13. Testing
```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:cov
```

## 14. Production Deployment
For production deployment:
1. Build all services:
```bash
npm run build
```
2. Set production environment variables.
3. Start services using PM2 or another process manager:
```bash
pm2 start dist/main.js --name order-service
pm2 start dist/main.js --name processing-service
```
4. Ensure RabbitMQ clustering for high availability.

## 15. Additional Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Swagger UI](http://localhost:3000/api) (Order Service)
- [Swagger UI](http://localhost:3001/api) (Processing Service)

