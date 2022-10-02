import { getDocument } from "../lib/document.js"
import { parseDateWithTime, parsePrice, parseAllergens, parseDateOfOrder, parseSelected } from "../lib/parsers.js"

export const getOrders = async (raw) => {
    const d = getDocument(raw)
    const orderElements = Array.from(d.getElementsByClassName('objednavka-obalka-jednotne'))

    let orders = []

    orderElements.forEach(element => {
        const dateEl = element.querySelector('.objednavka-den-datum')
        const date = parseDateOfOrder(dateEl)

        const order = {
            id: date.getTime(),
            date,
            meals: getMeals(element)
        }

        orders.push(order)
    })

    return orders
}

const getMeals = (element) => {
    const meals = []

    const mealElements = Array.from(element.getElementsByClassName('objednavka-jidlo-obalka'))
    mealElements.forEach((mealElement, index) => {
        const priceEl = mealElement.querySelector('.objednavka-jidlo-detail-cena')
        const allergensEl = mealElement.querySelector('.objednavka-jidlo-alergeny-udaje')
        const selectedEl = mealElement.querySelector('.objednavka-jidlo-zmena')
        const endOfCheckInEl = mealElement.querySelector('.objednavka-jidlo-detail-konecObjednavani')
        const endOfCheckOutEl = mealElement.querySelector('.objednavka-jidlo-detail-konecOdhlaseni')
        const canChangeEl = mealElement.querySelector('.zaskrtavaciPolicko')

        let canChange = canChangeEl.classList.contains('zaskrtavaciPolicko-povolene') ? true : false

        const meal = {
            id: index,
            name: mealElement.querySelector('.objednavka-jidlo-nazev').textContent,
            description: mealElement.querySelector('.objednavka-jidlo-popis').textContent,
            selected: parseSelected(selectedEl),
            canChange,
            allergens: parseAllergens(allergensEl),
            details: {
                price: parsePrice(priceEl),
                endOfCheckIn: parseDateWithTime(endOfCheckInEl),
                endOfCheckOut: parseDateWithTime(endOfCheckOutEl),
            }
        }

        meals.push(meal)
    })

    return meals
}

export const changeOrder = (orders, orderId, mealId, state) => {
    const orderIndex = orders.findIndex(order => order.id === orderId)
   
    if (orderIndex < 0)
        throw new Error(`Order ${orderId} not found`)

    const mealIndex = orders[orderIndex].meals.findIndex(meal => meal.id === mealId)

    if (mealIndex < 0)
        throw new Error(`Meal ${orderId}-${mealId} not found`)

    if (!orders[orderIndex].meals[mealIndex].canChange)
        throw new Error(`Meal ${orderId}-${mealId} cannot be changed`)

    orders[orderIndex].meals[mealIndex].selected = state

    for (const [index, meal] of orders[orderIndex].meals.entries()) {
        if (meal.selected === true && meal.canChange && meal.id !== mealId)
            orders[orderIndex].meals[index].selected = false
    }

    return orders
}