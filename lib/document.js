import jsdom from 'jsdom'
const { JSDOM } = jsdom

export const getDocument = (raw) => {
    const dom = new JSDOM(raw)
    return dom.window.document
}