import { getDocument } from "../lib/document.js"
import { parseDispensingDate } from "../lib/parsers.js"

export const getDispensing = async (raw) => {
    const d = getDocument(raw)
    const dispensingElements = Array.from(d.getElementsByClassName('vydej-den-obalka'))

    let dispensing = []
    dispensingElements.forEach(element => {
        const descriptionEl = element.querySelector('.vydej-den-druh-text')
        const pickedEl = element.querySelector('.vydej-den-vyzvednuti')
        const dateEl = element.querySelector('.vydej-den-datum')
        const timeEl = element.querySelector('.vydej-den-informace')

        if (descriptionEl) {
            let picked = pickedEl.classList.contains('vydej-den-vyzvednuto') ? true : false
            let dates = parseDispensingDate(dateEl, timeEl)
            let mealVoucher = false

            if (pickedEl.classList.contains('vydej-den-stravenka')) {
                picked = true
                mealVoucher = true
            }

            const dispensingDay = {
                description: descriptionEl.textContent,
                ...dates,
                picked,
                mealVoucher
            }

            dispensing.push(dispensingDay)
        }
    })

    return dispensing
}