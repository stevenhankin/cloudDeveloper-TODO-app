import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE

/**
 * Deletes a TODO for the specified todoId
 * @param event 
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  try {

    const params = {
      TableName: TODO_TABLE,
      Key: { todoId }
    };

    await docClient.delete(params).promise();

    // SUCCESS
    logger.info('✅ Deleted TODO', { todoId });
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
  catch (e) {
    // FAIL
    logger.error('❌ Unable to delete TODO', { e });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }

}
