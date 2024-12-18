export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'order_queue',
    queueOptions: {
      durable: true,
    },
  },
  swagger: {
    title: 'Processing Service',
    description: 'The Processing Service API description',
    version: '1.0',
  },
}); 