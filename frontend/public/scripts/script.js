async function submitData() {
    const numPedido = document.getElementById('numPedido')
    const statPedido = document.getElementById('statPedido')
    const datePedido = document.getElementById('datePedido')
    const sendStatus = document.getElementById('sendStatus')

    // Formatar data
    const dateArr = datePedido.value.split("-")
    dateArr[0] = dateArr[0] || ""
    dateArr[1] = dateArr[1] || ""
    dateArr[2] = dateArr[2] || ""
    const dateFormatada = dateArr[2] + "/" + dateArr[1] + "/" + dateArr[0]
    console.log(dateFormatada)

    if (numPedido.value && (dateFormatada != "//" || statPedido.value != "0")) {
        // Enviar dados
        const response = await fetch('/api/pedido', {
            method: "POST",
            body: JSON.stringify({
                numPedido: numPedido.value,
                statPedido: statPedido.value,
                datePedido: dateFormatada
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
            sendStatus.innerHTML = "Pedido atualizado com sucesso"
        }
        else {
            sendStatus.classList.remove("text-success")
            sendStatus.classList.add("text-danger")
            sendStatus.innerHTML = "Erro no servidor ao criar o pedido"
        }

        // Resetar valores
        numPedido.value = ""
        statPedido.value = "0"
        datePedido.value = ""
    }
    else {
        // Mudar o texto de status
        sendStatus.classList.remove("text-success")
        sendStatus.classList.add("text-danger")
        sendStatus.innerHTML = "Digite o número do pedido e preencha pelo menos um dos valores, status ou a data"
    }
}