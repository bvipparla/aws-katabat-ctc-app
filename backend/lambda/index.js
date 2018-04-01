'use strict'
const AWS = require('aws-sdk')
let doc = new AWS.DynamoDB.DocumentClient()
let participantsTable = process.env.PARTICIPANTS_TABLE
let initiativesTable = process.env.INITIATIVES_TABLE

console.log('Loading function')

exports.handler = function (event, context, callback) {
  console.log('request: ' + JSON.stringify(event))
  handleHttpMethod(event, context)
}

function handleHttpMethod (event, context) {
  let httpMethod = event.httpMethod
  if (event.path.match(/^\/participants/)) {
    if (httpMethod === 'GET') {
      return handleParticipantsGET(event, context)
    } else if (httpMethod === 'POST') {
      return handleParticipantsPOST(event, context)
    }
  }
  return errorResponse(context, 'Unhandled http method:', httpMethod)
}

function handleParticipantsGET (event, context) {
  console.log('handling Participants GET !!!')
  // let year = getYearFromParticipantsPath(event.path)
  // if (!year) { return errorResponse(context, 'Error: year not found in uri path.') }
  let year=2018
  let params = {
    TableName: participantsTable,
    KeyConditionExpression: 'yyyy = :key',
    ExpressionAttributeValues: { ':key': year }
  }

  console.log('GET query: ', JSON.stringify(params))
  doc.query(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: ', err) }
    return successResponse(context, {participants: data.Items})
  })
}

function handleParticipantsPOST (event, context) {
  let participant = JSON.parse(event.body)
  if (!participant || !participant.Id || !participant.yyyy) { return errorResponse(context, 'Error: participant.Id or participant.yyyy not found') }
  participant.createdBy = event.requestContext.identity.cognitoIdentityId
  let params = { TableName: participantsTable, Item: participant }

  console.log('Inserting participant', JSON.stringify(participant))
  doc.put(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: could not add participant', err.message) }
    updateInitiativesTable(participant, 'added', () => successResponse(context, {participant: participant}))
  })
}

function updateInitiativesTable (participant, action, callback) {
  let expressions = []
  if (action === 'added') {
    expressions = [updateCounts(participant, true)]
  }
  updateTable(expressions, callback)
}

function updateCounts (participant, inc) {
  return {
    TableName: initiativesTable,
    ExpressionAttributeNames: {'#a': 'added'},
    ExpressionAttributeValues: {':val': inc ? 1 : -1},
    Key: {'yyyy': participant.yyyy, 'Id': '1'},
    UpdateExpression: 'ADD #a :val'
  }
}

function updateTable (expressions, callback) {
  let params = expressions.shift()
  console.log('updating initiatives table', params)
  doc.update(params, (err) => {
    if (err) { console.log('error updating initiatives table', err) }
    if (expressions.length) {
      updateTable(expressions, callback)
    } else {
      if (callback) { callback() }
    }
  })
}

function getYearFromParticipantsPath (path) {
  return path.match(/participants\/(.*)/)[1]
}

function errorResponse (context, logline) {
  let response = { statusCode: 404, body: JSON.stringify({ 'Error': 'Could not execute request' }) }
  let args = Array.from(arguments).slice(1)
  console.log.apply(null, args)
  context.succeed(response)
}

function successResponse (context, body) {
  let response = { statusCode: 200, body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': '*' } }
  console.log('response: ' + JSON.stringify(response))
  context.succeed(response)
}
