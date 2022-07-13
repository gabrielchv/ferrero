"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require("dotenv/config");
require('dotenv').config();
const fs = require("fs");
// Criar o credentials.json
fs.writeFile("credentials.json", process.env.CREDENTIALS, 'utf8', () => { });
const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/frontend/public'));
// Pedir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/index.html"));
});
// Request pra criar o pedido
app.post('/api/pedido', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Opções
    const opcoesEstadoDoPedido = [
        'PO CONFIRMADO E EM PREPARAÇÃO',
        'DESPACHADO PARA TRANSPORTADORA',
        'DESPACHADO PARA A FERRERO',
        'DISPONÍVEL PARA COLETA',
        'EM ATRASO',
        'CANCELADO'
    ];
    // Pegar data atual
    const ts = Date.now();
    const date_ob = new Date(ts);
    const date = date_ob.getDate();
    const month = date_ob.getMonth() + 1;
    const year = date_ob.getFullYear();
    const dataAtual = date + "/" + month + "/" + year;
    // Dados do request
    const numPedido = req.body.numPedido;
    const statPedido = opcoesEstadoDoPedido[req.body.statPedido - 1];
    // formatando datas
    let prazoFaturamento = req.body.prazoFaturamento;
    if (prazoFaturamento == "//") {
        prazoFaturamento = "";
    }
    let datePedido = req.body.datePedido;
    if (datePedido == "//") {
        datePedido = "";
    }
    try {
        // Garantir que possui o numero de pedido e pelo menos um dado
        if (numPedido && (statPedido || datePedido || prazoFaturamento)) {
            console.log("Pedido atualizado");
            // Autenticar no google sheets
            const auth = new google.auth.GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            });
            const client = yield auth.getClient();
            const googleSheets = google.sheets({ version: "v4", auth: client });
            const spreadsheetId = process.env.SPREADSHEETID;
            // Enviar os dados para o sheets
            yield googleSheets.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: "Sheet!A:E",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [
                        [numPedido, statPedido || "", datePedido || "", prazoFaturamento, dataAtual]
                    ]
                }
            });
            res.send({ status: true });
        }
    }
    catch (error) {
        console.log("Erro ao cadastrar, erro: " + error);
        res.send({ status: false });
    }
}));
app.listen(process.env.PORT || 8000, () => console.log(`http://localhost:8000/`));
