import { Injectable, Inject, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './tasks.schema';
import { ClientProxy } from '@nestjs/microservices';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);
  private readonly cacheKey = 'tasks';
  private redisClient: RedisClientType;

  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @Inject('TASKS_EVENT_SERVICE') private client: ClientProxy,
  ) {}

  async onModuleInit() {
    this.redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    });
    await this.redisClient.connect();
  }

  async findAll(): Promise<any[]> {
    const cachedJson = await this.redisClient.get(this.cacheKey);
    if (cachedJson) {
      this.log('cacheHit', null, {});
      return JSON.parse(cachedJson);
    }
    const docs = await this.taskModel.find().exec();
    const tasks = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      completed: doc.completed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    await this.redisClient.set(this.cacheKey, JSON.stringify(tasks), { EX: 30 });
    this.log('cacheMiss', null, {});
    return tasks;
  }

  async create(input: { title: string }): Promise<Task> {
    const created = new this.taskModel(input);
    const task = await created.save();
    await this.redisClient.del(this.cacheKey);
    this.client.emit('tasks.events', { operation: 'create', taskId: task.id, payload: task });
    this.log('create', task.id, task);
    return task;
  }

  async update(id: string, input: Partial<{ title: string; completed: boolean }>): Promise<Task> {
    const task = await this.taskModel.findByIdAndUpdate(id, input, { new: true }).exec();
    if (!task) {
      this.log('updateFail', id, input);
      throw new NotFoundException(`Task ${id} not found`);
    }
    await this.redisClient.del(this.cacheKey);
    this.client.emit('tasks.events', { operation: 'update', taskId: id, payload: input });
    this.log('update', id, input);
    return task;
  }

  async remove(id: string): Promise<boolean> {
    await this.taskModel.findByIdAndDelete(id).exec();
    await this.redisClient.del(this.cacheKey);
    this.client.emit('tasks.events', { operation: 'delete', taskId: id, payload: null });
    this.log('delete', id, {});
    return true;
  }

  private log(operation: string, taskId: string | null, payload: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      operation,
      taskId,
      payload,
    };
    console.log(JSON.stringify(entry));
  }
}
