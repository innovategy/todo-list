import { Resolver, Query, Mutation, Args, ID, Subscription, ObjectType, Field } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './tasks.schema';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub<any>();

@ObjectType()
export class TaskEvent {
  @Field()
  operation: string;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => String, { nullable: true })
  taskId?: string;
}

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task])
  tasks() {
    return this.tasksService.findAll();
  }

  @Mutation(() => Task)
  async createTask(@Args('title') title: string) {
    const task = await this.tasksService.create({ title });
    pubSub.publish('taskEvents', { taskEvents: { operation: 'create', task, taskId: task.id } });
    return task;
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('completed', { type: () => Boolean, nullable: true }) completed?: boolean,
  ) {
    const task = await this.tasksService.update(id, { title, completed });
    pubSub.publish('taskEvents', { taskEvents: { operation: 'update', task, taskId: id } });
    return task;
  }

  @Mutation(() => Boolean)
  async deleteTask(@Args('id', { type: () => ID }) id: string) {
    const ok = await this.tasksService.remove(id);
    if (ok) {
      pubSub.publish('taskEvents', { taskEvents: { operation: 'delete', task: null, taskId: id } });
    }
    return ok;
  }

  @Subscription(() => TaskEvent, {
    name: 'taskEvents',
    resolve: payload => payload.taskEvents,
  })
  taskEvents() {
    return (pubSub as any).asyncIterator('taskEvents');
  }
}
