import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // TODO: Get all TODO items for a current user
  logger.info('getTodos', { event })

  try {

    const params = {
      TableName: TODO_TABLE,
      FilterExpression: 'userId=:u',
      ExpressionAttributeValues: { ':u': 'steve' } // TODO : specify current user
    };

    const result = await docClient.scan(params).promise();

    logger.info('scan result', { result })

    // SUCCESS
    logger.info('✅ Scanned TODO');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Items)
    }
  }
  catch (e) {
    // FAIL
    logger.error('❌ Unable to scan TODO', { e });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
