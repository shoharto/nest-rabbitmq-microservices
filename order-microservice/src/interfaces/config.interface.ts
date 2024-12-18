export interface AppConfig {
  port: number;
  rabbitmq: {
    url: string;
    queue: string;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
  };
}
