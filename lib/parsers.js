export const parseDateWithTime = (element) => {
    if (!element)
        return null

    const string = element.textContent

    const rawDate = string.split(': ')[1]
    const segments = rawDate.split(' ')

    const date = segments[1].split('.')
    const time = segments[2].split(':')

    const year = new Date().getFullYear()

    return new Date(year, Number(date[1]) - 1, Number(date[0]), Number(time[0]), Number(time[1]))
}

export const parsePrice = (element) => {
    if (!element)
        return null

    const string = element.textContent
    const segments = string.split(' ')

    return {
        value: Number(segments[1].replace(',', '.')),
        currency: segments[2].toLowerCase()
    }
}

export const parseAllergens = (element) => {
    if (!element)
        return null

    let string = element.textContent
    string = string.substring(23).slice(0, -101).replaceAll(' ', '').split('-')

    string = string.map(item => {
        const i = item.replace(/[0-9]/g, '')

        if (i.length > 1)
            return i.replace('(', ' (')
    })

    const result = []
    string.forEach(item => {
        if (item) {
            if (item[0] === item[0].toLowerCase())
                result[result.length - 1] += ` - ${item}`
            else
                result.push(item)
        }
    })

    return result
}

export const parseDateOfOrder = (element) => {
    if (!element)
        return null

    const string = element.textContent
    const parts = string.trim().replaceAll('.', '').split(' ')
    
    const day = Number(parts[1])
    const monthIndex = Number(parts[2])
    const year = new Date().getFullYear()

    return new Date(year, monthIndex, day)
}

export const parseSelected = (element) => {
    if (!element)
        return false

    const input = element.querySelector('input')
    const val = input.value

    return val === 'zaskrtnuto' ? true : false
}

export const parseDispensingDate = (dateEl, timeEl) => {
    const string = dateEl.textContent
    const parts = string.split(' ')

    const day = Number(parts[0])
    const monthIndex = Number(parts[1]) -1
    const year = new Date().getFullYear()

    let pickupTime = null
    if (/^\d/.test(timeEl.title)) {
        const time = timeEl.title.trim().split(':')
        pickupTime = new Date(year, monthIndex, day, Number(time[0]), Number(time[1])).getTime() 
    }

    return {
        date: new Date(year, monthIndex, day),
        pickupTime
    }
}

export const parseOrdersForSaving = (orders) => {
    let result = ''

    orders.forEach(order => {
        order.meals.forEach(meal => {
            result += `${meal.selected ? 1 : 0};`
        })
    })

    return result.slice(0, -1)
}