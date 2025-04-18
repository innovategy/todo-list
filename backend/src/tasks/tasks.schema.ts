import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Task extends Document {
  @Field(() => ID)
  declare id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ default: false })
  completed: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.virtual('id').get(function (this: any) { return this._id.toHexString(); });
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });
