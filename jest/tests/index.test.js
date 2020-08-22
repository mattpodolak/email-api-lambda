const index = require('../../function/index')
const fs = require('fs')
const AWSXRay = require('aws-xray-sdk-core')
AWSXRay.setContextMissingStrategy('LOG_ERROR')

test('Test email function handler', async () => {
    jest.setTimeout(30000);
    let eventFile = fs.readFileSync('event.json')
    let event = JSON.parse(eventFile)
    let response = await index.handler(event, null)
    expect(JSON.stringify(response)).toContain('Message Sent')
  }
)