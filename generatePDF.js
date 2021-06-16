function generatePDF() {
    var doc = new jsPDF();
    var fileName = 'document.pdf';
	
	// Montagem do PDF: nesse caso, a geração do PDF foi feita partir de HTML, porém poderia se usar um doc.text('') para inserir um conteúdo.
	
    var specialElementHandlers = {
        '#editor': function (element, renderer) {
            return true;
        }
    };

    doc.fromHTML($('#conteudo').html(), 15, 15, {
        'width': 170,
            'elementHandlers': specialElementHandlers
    });

    fetch(
        `/api/public/2.0/contentfiles/upload/?fileName=${fileName}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            cache: "no-cache",
            body: doc.output('blob')
        }
    ).then(function (response) {
        if (!response.ok) {
            throw "Erro ao enviar o arquivo.";
        }
    }).then(function () {
        // Criação o Documento no GED
        let document = {
            companyId: window.parent.WCMAPI.organizationId,
            description: fileName,
            immutable: true,
            parentId: 1609, // ID da pasta onde salvar o PDF
            isPrivate: false,
            downloadEnabled: true,
            attachments: [{
                fileName: fileName,
            }],
        };

        return fetch(
            "/api/public/ecm/document/createDocument",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                cache: "no-cache",
                body: JSON.stringify(document)
            }
        )
        .then(function (response) {
            if (!response.ok) {
                throw "Erro ao Salvar documento na Pasta Indicada";
            }
            return response.json();
        })
        .then(response => response.content);
    });
}