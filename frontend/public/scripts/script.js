function dateFormat(date) {
    const dateArr = date.value.split("-")
    dateArr[0] = dateArr[0] || ""
    dateArr[1] = dateArr[1] || ""
    dateArr[2] = dateArr[2] || ""
    return dateArr[2] + "/" + dateArr[1] + "/" + dateArr[0]
}

async function submitData() {
    const numPedido = document.getElementById('numPedido')
    const statPedido = document.getElementById('statPedido')
    const datePedido = document.getElementById('datePedido')
    const sendStatus = document.getElementById('sendStatus')
    const prazoFaturamento = document.getElementById('prazoFaturamento')

    dateFormatada = dateFormat(datePedido);
    prazoFaturamentoFormatada = dateFormat(prazoFaturamento);

    if (numPedido.value && (dateFormatada != "//" || statPedido.value != "0" || prazoFaturamentoFormatada != "//")) {
        try {
            // Enviar dados
            const response = await fetch('/api/pedido', {
                method: "POST",
                body: JSON.stringify({
                    numPedido: numPedido.value,
                    statPedido: statPedido.value,
                    datePedido: dateFormatada,
                    prazoFaturamento: prazoFaturamentoFormatada
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            })
            const data = await response.json()

            // Mudar o texto de status
            if (data.status == true) {
                sendStatus.classList.add("text-success")
                sendStatus.classList.remove("text-danger")
                sendStatus.innerText = "Pedido atualizado com sucesso"
            }
            else {
                sendStatus.classList.remove("text-success")
                sendStatus.classList.add("text-danger")
                sendStatus.innerText = "Erro no servidor ao criar o pedido"
            }

            // Resetar valores
            numPedido.value = ""
            statPedido.value = "0"
            datePedido.value = ""
            prazoFaturamento.value = ""

        } catch (error) {
            sendStatus.classList.remove("text-success")
            sendStatus.classList.add("text-danger")
            sendStatus.innerText = "O servidor não está respondendo"
        }

    }
    else {
        // Mudar o texto de status
        sendStatus.classList.remove("text-success")
        sendStatus.classList.add("text-danger")
        sendStatus.innerText = "Digite o número do pedido e preencha pelo menos um dos valores, prazo para faturamento, status ou data"
    }
}