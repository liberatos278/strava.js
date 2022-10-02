import axios from "axios"
import FormData from "form-data"
import { Routes } from "../lib/routes.js"

export const login = async (credentials) => {
    try {
        const data = new FormData()

        for (const property in credentials) {
            const value = credentials[property]
            data.append(property, value)
        }

        const res = await axios({
            method: 'post',
            maxRedirects: 0,
            validateStatus: (status) => {
                return status >= 200 && status <= 302
            },
            url: Routes.login,
            params: { zarizeni: credentials.zarizeni },
            headers: {
                ...data.getHeaders()
            },
            data: data
        })

        if (res.status !== 302)
            throw new Error('Login failed - check your credentials')

        const fragments = res.headers['set-cookie']
        const sessionCookie = fragments.find(fragment => fragment.includes('ASP.NET_SessionId'))
        const sessionId = sessionCookie.split('; ')[0].split('=')[1]

        return sessionId

    } catch (err) {
        throw err
    }
}