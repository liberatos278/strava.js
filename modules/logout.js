import axios from "axios"
import { Routes } from "../lib/routes.js"

export const logout = async (sessionId) => {
    try {
        const res = await axios({
            method: 'get',
            maxRedirects: 0,
            validateStatus: (status) => {
                return status >= 200 && status <= 302
            },
            url: Routes.logout,
            headers: {
                Cookie: `ASP.NET_SessionId=${sessionId}`
            }
        })

        if (res.status !== 302)
            throw new Error('Logout failed')
    } catch (err) {
        throw err
    }
} 