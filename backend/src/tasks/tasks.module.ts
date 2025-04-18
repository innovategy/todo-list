import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Task, TaskSchema } from './tasks.schema';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ClientsModule.register([
      {
        name: 'TASKS_EVENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'tasks.events',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [TasksResolver, TasksService],
})
export class TasksModule {}
