import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();

const TODO_TABLE = process.env.TODO_TABLE
const FILE_UPLOAD_S3_BUCKET = process.env.FILE_UPLOAD_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Entered update handler')
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  try {

    // Get the current version of the TODO...
    const getTodo = await docClient.get({ TableName: TODO_TABLE, Key: { todoId } }).promise();
    const currentTodo = getTodo.Item;

    // ..determine the bucket image location
    const attachmentUrl= `https://${FILE_UPLOAD_S3_BUCKET}.s3.eu-west-2.amazonaws.com/${todoId}`

    // ...then PATCH it with the supplied details
    const newTodo = { ...currentTodo, ...updatedTodo, attachmentUrl };
    logger.info('NEW todo',{newTodo});

    // ...and update the record
    const params = {
      TableName: TODO_TABLE,
      Key: { todoId },
      UpdateExpression: 'set attachmentUrl = :u, dueDate = :due, done = :done',
      ExpressionAttributeValues: {
        ':u': newTodo.attachmentUrl,
        ':due': newTodo.dueDate,
        ':done': newTodo.done
      }
    };
    await docClient.update(params).promise();

    // SUCCESS
    logger.info('✅ Updated TODO', { todoId });
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
