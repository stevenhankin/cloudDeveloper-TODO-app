// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '...'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-h22b0uti.eu.auth0.com',            // Auth0 domain
  clientId: 'kVhkaTOYIZYhFryediLEZPMVeQ6zpRVe',   // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
