import { getDocument } from "../lib/document.js"
import { parsePrice } from "../lib/parsers.js"

export const getOverpayment = async (raw) => {
    const d = getDocument(raw)
    const overpaymentEl = d.querySelector('.konto')

    return parsePrice(overpaymentEl)
}