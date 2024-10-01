import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

export const Ack = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const [payload, rmqContext] = ctx.getArgs<[any, RmqContext]>();
  const channel = rmqContext.getChannelRef();
  const originalMessage = rmqContext.getMessage();

  channel.ack(originalMessage);

  return ctx;
});
