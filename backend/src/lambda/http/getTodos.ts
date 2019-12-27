import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserIdFromJwt } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
const TODO_TABLE = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {

    const userId = getUserIdFromJwt(event);

    const params = {
      TableName: TODO_TABLE,
      FilterExpression: 'userId=:u',
      ExpressionAttributeValues: { ':u': userId } // TODO : specify current user
    };

    logger.info(`scanning for user ${userId}`);
    const result = await docClient.scan(params).promise();

    // SUCCESS
    logger.info('✅ Scanned TODO');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({items:result.Items})
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
