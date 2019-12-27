import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuid } from 'uuid';
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
import { getUserIdFromJwt } from '../../auth/utils';
import { TodoItem } from '../../models/TodoItem';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE


/**
 * Creates a new TODO item
 * @param event 
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const { name, dueDate }: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserIdFromJwt(event);
    const newTodo: TodoItem = {
      todoId: uuid(),
      userId,
      createdAt: JSON.stringify(new Date()),
      name,
      dueDate,
      done: false
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
      body: JSON.stringify({ item: newTodo })
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
