import { getDocument } from "../lib/document.js"
import { parsePrice } from "../lib/parsers.js"

export const getPayments = async (raw) => {
    const d = getDocument(raw)
    const paymentsElements = Array.from(d.getElementsByClassName('platby-platba-obalka'))

    let payments = []
    paymentsElements.forEach(element => {
        if (!element.classList.contains('platby-platba-nadpis')) {
            const amountEl = element.querySelector('.platby-platba-castka')
            const descEl = element.querySelector('.platby-platba-popis')
            const dateEl = element.querySelector('.platby-platba-datum')
            const dateParts = dateEl.textContent.split('. ')

            amountEl.textContent = '.: ' + amountEl.textContent

            payments.push({
                description: descEl.textContent,
                details: parsePrice(amountEl),
                date: new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]))
            })
        }
    })

    return payments
}