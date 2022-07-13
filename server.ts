const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { google } = require('googleapis')
import 'dotenv/config'
require('dotenv').config()
const fs = require("fs")

// Criar o credentials.json
fs.writeFile("credentials.json", process.env.CREDENTIALS, 'utf8', () => {});

const app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/frontend/public'))

// Pedir a página principal
app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "/frontend/index.html"))
})

// Request pra criar o pedido
app.post('/api/pedido', async (req: any, res: any) => {
  // Opções
  const opcoesEstadoDoPedido = [
    'PO CONFIRMADO E EM PREPARAÇÃO',
    'DESPACHADO PARA TRANSPORTADORA',
    'DESPACHADO PARA A FERRERO',
    'DISPONÍVEL PARA COLETA',
    'EM ATRASO',
    'CANCELADO'
  ]

  // Pegar data atual
  const ts = Date.now()
  const date_ob = new Date(ts)
  const date = date_ob.getDate()
  const month = date_ob.getMonth() + 1
  const year = date_ob.getFullYear()
  const dataAtual = date + "/" + month + "/" + year

  // Dados do request
  const numPedido = req.body.numPedido
  const statPedido = opcoesEstadoDoPedido[req.body.statPedido - 1]
  // formatando datas
  let prazoFaturamento = req.body.prazoFaturamento
  if (prazoFaturamento == "//") {
    prazoFaturamento = ""
  }
  let datePedido = req.body.datePedido
  if (datePedido == "//") {
    datePedido = ""
  }

  try {
    // Garantir que possui o numero de pedido e pelo menos um dado
    if (numPedido && (statPedido || datePedido || prazoFaturamento != "")) {
      console.log("Pedido atualizado")

      // Autenticar no google sheets
      const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
      const client = await auth.getClient()
      const googleSheets = google.sheets({version: "v4", auth: client})
      const spreadsheetId = process.env.SPREADSHEETID

      // Enviar os dados para o sheets
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet!A:E",
        valueInputOption: "USER_ENTERED",
        resource: {
          values : [
            [numPedido, statPedido || "", datePedido || "", prazoFaturamento, dataAtual]
          ]
        }
      })
      res.send({status: true})
    }
  } 
  catch (error) {
    console.log("Erro ao cadastrar, erro: " + error)
    res.send({status: false})
  }
})

app.listen(process.env.PORT || 8000, () => console.log(`http://localhost:8000/`))