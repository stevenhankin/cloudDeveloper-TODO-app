import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuid } from 'uuid';
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
import { getUserIdFromJwt } from '../../auth/utils';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE

interface TODO {
  todoId: string;
  userId: string;
  createdAt: string;
  name: string;
  dueDate: string;
  done: boolean;
  attachmentUrl: string;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {

    const { name, dueDate }: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserIdFromJwt(event);

    // Construct new TODO object
    const newTodo: TODO = {
      todoId: uuid(),
      userId,
      createdAt: JSON.stringify(new Date()),
      name,
      dueDate,
      done: false,
      attachmentUrl: ''
    }

    const params = {
      TableName: TODO_TABLE,
      Item: newTodo
    };

    await docClient.put(params).promise();

    // Return SUCCESS
    logger.info('Created TODO', { newTodo });
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({item:newTodo})
    }
  }
  catch (e) {
    // Return FAIL
    logger.error('Unable to create TODO', { e });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
