import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './tasks.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly cacheKey = 'tasks';

  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('TASKS_EVENT_SERVICE') private client: ClientProxy,
  ) {}

  async findAll(): Promise<Task[]> {
    const cached = await this.cacheManager.get<Task[]>(this.cacheKey);
    if (cached) {
      this.log('cacheHit', null, {});
      return cached;
    }
    const tasks = await this.taskModel.find().exec();
    await this.cacheManager.set(this.cacheKey, tasks, 30);
    this.log('cacheMiss', null, {});
    return tasks;
  }

  async create(input: { title: string }): Promise<Task> {
    const created = new this.taskModel(input);
    const task = await created.save();
    await this.cacheManager.del(this.cacheKey);
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
    await this.cacheManager.del(this.cacheKey);
    this.client.emit('tasks.events', { operation: 'update', taskId: id, payload: input });
    this.log('update', id, input);
    return task;
  }

  async remove(id: string): Promise<boolean> {
    await this.taskModel.findByIdAndDelete(id).exec();
    await this.cacheManager.del(this.cacheKey);
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
