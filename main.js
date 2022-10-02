import axios from "axios"
import FormData from "form-data"
import { Routes } from "./lib/routes.js"
import { login } from "./modules/login.js"
import { logout } from "./modules/logout.js"
import { changeOrder, getOrders } from "./modules/orders.js"
import { getOverpayment } from "./modules/overpayment.js"
import { getDispensing } from "./modules/dispensing.js"
import { getPayments } from "./modules/payments.js"
import { getMessages } from "./modules/messages.js"
import { parseOrdersForSaving } from "./lib/parsers.js"

/** 
 *  @typedef ClientOptions
 *  @property {boolean} refreshSession Automatically renews the session if it expires.
 *  @property {boolean} autoSave Saves orders immediately after using the changeOrder() & changeOrders() method.
 * 
 *  @typedef FinancialAmount
 *  @property {number} amount Amount.
 *  @property {string} currency Currency.
 * 
 *  @typedef Order
 *  @property {number} id Order ID (order unix timestamp).
 *  @property {Date} date Order date.
 *  @property {Array<Meal>} meals Order meals.
 * 
 *  @typedef Meal
 *  @property {number} id ID.
 *  @property {string} name Name.
 *  @property {string} description Description.
 *  @property {boolean} selected Is meal selected.
 *  @property {boolean} canChange Can meal be changed.
 *  @property {(Array<string>|null)} allergens Allergens.
 *  @property {MealDetails} details Details.
 * 
 *  @typedef MealDetails
 *  @property {(FinancialAmount|null)} price Price.
 *  @property {(Date|null)} endOfCheckIn End of meal check-in.
 *  @property {(Date|null)} endOfCheckOut End of meal check-out.
 * 
 *  @typedef Dispensing
 *  @property {string} description Description.
 *  @property {Date} date Date of dispensing.
 *  @property {(number|null)} pickupTime Meal pickup time.
 *  @property {boolean} picked Was meal picked up.
 *  @property {boolean} mealVoucher Was meal voucher used to pick up meal.
 * 
 *  @typedef Payment
 *  @property {string} description Description.
 *  @property {Date} date Date of payment.
 *  @property {FinancialAmount} details Details.
 * 
 *  @typedef Message
 *  @property {string} subject Message subject.
 *  @property {string} recipient Message recipient.
 *  @property {Date} date Date the message was sent.
 * 
 *  @typedef ChangeMealOptions
 *  @property {number} orderId Order ID.
 *  @property {number} mealId Meal ID.
 *  @property {boolean} state Is meal selected.
 */

export class Client {
    sessionId = null

    /**
    * Create a new client to communicate with the API. 
    * @param { string } username User login name.
    * @param { string } password User password.
    * @param { number } code Facility (canteen) code.
    * @param { ClientOptions } options Client's options.
    * @returns { Client } Client instance.
    */
    constructor(username, password, code, options) {
        this.username = username
        this.password = password
        this.code = code
        this.options = options ?? {}
    }

    _checkSession() {
        if (!this.sessionId) {
            throw new Error('You must be logged in to use this method.')
        }
    }

    async _hasSessionExpired(res, func, call) {
        if (res.request.path.endsWith('Prihlaseni')) {
            if (this.options.refreshSession)
                return await this.login().then(async () => await func())
            else
                throw new Error('Session has expired. Please login again or use `refreshSession` option')
        } else
            return await call()
    }

    /**
    * Logs the user in which creates a sessionId.
    * @async
    * @returns { Promise<string> } sessionId.
    */
    async login(callback) {
        const credentials = {
            uzivatel: this.username,
            heslo: this.password,
            zarizeni: this.code
        }

        if (!this.username || !this.password || !this.code)
            throw new Error('You must provide username, password and code to login')

        const sessionId = await login(credentials)
        this.sessionId = sessionId

        if (callback)
            callback(sessionId)

        return this.sessionId
    }

    /**
    * Logout the user and invalidate sessionId.
    * @async
    */
    async logout() {
        this._checkSession()

        await logout(this.sessionId)
        this.sessionId = null
    }

    /**
    * Gets the user's overpayment.
    * @async
    * @returns { Promise<FinancialAmount> } User's overpayment.
    */
    async getOverpayment() {
        this._checkSession()

        const res = await axios({
            method: 'get',
            url: Routes.canteen,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`
            }
        })

        const overpayment = await this._hasSessionExpired(res, () => this.getOverpayment(), () => getOverpayment(res.data))
        return overpayment
    }

    /**
    * Gets the user's orders.
    * @async
    * @returns { Promise<Order[]> } user's orders.
    */
    async getOrders() {
        this._checkSession()

        const res = await axios({
            method: 'get',
            url: Routes.orders,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`
            }
        })

        let orders = await this._hasSessionExpired(res, () => this.getOrders(), () => getOrders(res.data))
        return orders
    }

    /**
    * Returns the user's picked up meals.
    * @async
    * @returns { Promise<Dispensing[]> } meals.
    */
    async getDispensings() {
        this._checkSession()

        const res = await axios({
            method: 'get',
            url: Routes.dispensing,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`
            }
        })

        let dispensing = await this._hasSessionExpired(res, () => this.getDispensings(), () => getDispensing(res.data))
        return dispensing
    }

    /**
    * Returns the user's payment history.
    * @async
    * @returns { Promise<Payment[]> } payments.
    */
    async getPayments() {
        this._checkSession()

        const res = await axios({
            method: 'get',
            url: Routes.payments,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`
            }
        })

        let payments = await this._hasSessionExpired(res, () => this.getPayments(), () => getPayments(res.data))
        return payments
    }

    /**
    * Returns the user's incoming messages.
    * @async
    * @returns { Promise<Message[]> } messages.
    */
    async getMessages() {
        this._checkSession()

        const res = await axios({
            method: 'get',
            url: Routes.messages,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`
            }
        })

        let messages = await this._hasSessionExpired(res, () => this.getMessages(), () => getMessages(res.data))
        return messages
    }

    /**
    * Change selected meal in one order.
    * @async
    * @param {number} orderId Order ID.
    * @param {number} mealId Meal ID.
    * @param {number} state New state for meal.
    * @returns { Promise<Order[]> } edited orders.
    */
    async changeOrder(orderId, mealId, state) {
        this._checkSession()

        const orders = await this.getOrders()
        const newOrders = changeOrder(orders, orderId, mealId, state)

        if (this.options.autoSave)
            await this.saveOrders(newOrders)

        return newOrders
    }

    /**
    * Change selected meal in many orders at the same time.
    * @async
    * @param {ChangeMealOptions} changes Meal changes in orders.
    * @returns { Promise<Order[]> } edited orders.
    */
    async changeOrders(changes) {
        this._checkSession()

        const orders = await this.getOrders()
        let result = orders

        for (const change of changes) {
            result = changeOrder(result, change.orderId, change.mealId, change.state)
        }

        if (this.options.autoSave)
            await this.saveOrders(result)

        return result
    }

    /**
    * Save changed meals in orders.
    * @async
    * @param {Order[]} orders Edited orders.
    */
    async saveOrders(orders) {
        this._checkSession()

        const data = {
            akce: 'uloz',
            objednavky: parseOrdersForSaving(orders)
        }

        const form = new FormData()
        form.append('p', JSON.stringify(data))

        const res = await axios({
            method: 'post',
            url: Routes.save,
            headers: {
                Cookie: `ASP.NET_SessionId=${this.sessionId}`,
                ...form.getHeaders()
            },
            data: form
        })

        if (res.data.chyba)
            throw new Error('Failed to save orders')
    }
}