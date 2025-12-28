import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const ip =
    event.headers['x-forwarded-for']?.split(',')[0] ||
    event.headers['client-ip'] ||
    'unknown';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ ip }),
  };
};
