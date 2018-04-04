'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()

app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(awsServerlessExpressMiddleware.eventContext())

// Write Custom Code from here onwards !!
const UUID = require('uuid')
const AWS = require('aws-sdk')
let doc = new AWS.DynamoDB.DocumentClient()
let participantsTable = process.env.PARTICIPANTS_TABLE
let participantsTable_fnindex = participantsTable + '_fn_idx'
let dashboardTable = process.env.DASHBOARD_TABLE
const ITEMS_PER_PAGE = 25

console.log('Loading function')

app.get('/participants/:yyyy', (req, res) => {
  console.log('Handling GET request')
  const year = req.params.yyyy ? req.params.yyyy : 2018
  const NO_OF_ITEMS = req.query.count ? Number(req.query.count) : ITEMS_PER_PAGE

  let params = {
    TableName: participantsTable,
    Limit: NO_OF_ITEMS,
    IndexName: participantsTable_fnindex,
    KeyConditionExpression: 'yyyy = :key',
    ExpressionAttributeValues: { ':key': Number(year) }
  }

  console.log(params)
  doc.query(params, (err, data) => {
    if (err) {
      console.log(err)
      return res.status(404).json({ 'error': err.message })
    }
    console.log(data)
    return res.json({ 'participants': data.Items })
  })

  // return res.json({ 'participants': params })
})

app.post('/participants', (req, res) => {
  console.log('Handling POST request')
  let participant = req.body
  if (!participant || !participant.Id) {
    participant.Id = UUID.v4()
    // res.status(404).json({ 'error': 'Error: participant.Id not found' })
  }
  console.log(req)
  participant.createdBy = req.apiGateway.event.requestContext.identity.cognitoIdentityId
  let params = { TableName: participantsTable, Item: participant }

  console.log('Inserting participant', JSON.stringify(participant))
  doc.put(params, (err, data) => {
    if (err) { return res.status(500).json({ 'error': 'Error: could not add participant' }) }
    updateDashboardTable(participant, 'added', () => successResponse(res, {'participant': participant}))
  })
})

function updateDashboardTable (participant, action, callback) {
  let expressions = []
  if (action === 'added') {
    expressions = [updateCounts(participant, true)]
  }
  updateTable(expressions, callback)
}

function updateCounts (participant, inc) {
  return {
    TableName: dashboardTable,
    ExpressionAttributeNames: {'#a': 'added'},
    ExpressionAttributeValues: {':val': inc ? 1 : -1},
    Key: {'yyyy': participant.yyyy, 'eType': '1'},
    UpdateExpression: 'ADD #a :val'
  }
}

function updateTable (expressions, callback) {
  let params = expressions.shift()
  console.log('updating dashboard table', params)
  doc.update(params, (err) => {
    if (err) { console.log('error updating dashboard table', err) }
    if (expressions.length) {
      updateTable(expressions, callback)
    } else {
      if (callback) { callback() }
    }
  })
}

function successResponse (res, body) {
  let response = { statusCode: 200, body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': '*' } }
  console.log('response: ' + JSON.stringify(response))
  return res.status(201).json(body)
}


// The aws-serverless-express library creates a server and listens on a Unix Domain Socket. No need of app.listen(port)

// Export your express server so you can import it in the lambda function.
module.exports = app
