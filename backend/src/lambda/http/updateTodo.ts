import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try {

    const params = {
      TableName: TODO_TABLE,
      Key: { todoId },
      UpdateExpression: 'set name = :n, dueDate = :due, done = :done',
      ExpressionAttributeValues: {
        ':n': updatedTodo.name,
        ':due': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    };

    await docClient.update(params).promise();

    // SUCCESS
    logger.info('✅ Updated TODO', { todoId });
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
  catch (e) {
    // FAIL
    logger.error('❌ Unable to update TODO', { e });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }

}
