import { getDocument } from "../lib/document.js"

export const getMessages = async (raw) => {
    const d = getDocument(raw)
    const messageElements = Array.from(d.getElementsByClassName('zpravy-zprava-informace'))

    let messages = []
    messageElements.forEach(element => {
        if (!element.classList.contains('zpravy-zprava-nadpis')) {
            const subjectEl = element.querySelector('.zpravy-zprava-predmet')
            const recipientEl = element.querySelector('.zpravy-zprava-adresat')
            const dateEl = element.querySelector('.zpravy-zprava-datum')

            let dateParts = dateEl.textContent.replaceAll('.', '').replaceAll(':', ' ').split(' ')
            dateParts.map(part => Number(part))

            messages.push({
                subject: subjectEl.textContent,
                recipient: recipientEl.textContent,
                date: new Date(dateParts[2], dateParts[1] - 1, dateParts[0], dateParts[3], dateParts[4], dateParts[5])
            })
        }
    })

    return messages
}