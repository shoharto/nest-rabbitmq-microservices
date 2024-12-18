export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'order_queue',
    queueOptions: {
      durable: true,
    },
  },
  swagger: {
    title: 'Order Service',
    description: 'The Order Service API description',
    version: '1.0',
  },
});