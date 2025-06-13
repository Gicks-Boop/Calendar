import { DEFAULT_SESSION_VAR } from './static'
import Dialog from '@/components/dialog/dialog'

class Session {
    context = null
    user = null
    userData = null
    static sessionVar = DEFAULT_SESSION_VAR
    constructor(vueContext) {
        this.context = vueContext
        // this.user = this.context.$cookies.get(DEFAULT_SESSION_VAR)
        if (this.user == null) {
            this.clearCookiesAndStorage()
            return
        }
        this.userData = localStorage.getItem(DEFAULT_SESSION_VAR)
        this.user = this.userData ? JSON.parse(this.userData) : null
    }
    clearCookiesAndStorage() {
        // this.context.$cookies.remove(DEFAULT_SESSION_VAR)
        localStorage.removeItem(DEFAULT_SESSION_VAR)
    }
    assignUser(user) {
        // this.context.$cookies.set(DEFAULT_SESSION_VAR, user.cve, "1h")
        localStorage.setItem(DEFAULT_SESSION_VAR, JSON.stringify(user))
        this.user = user
    }
    static GetSession() {
        const _session = localStorage.getItem(DEFAULT_SESSION_VAR)
        return _session ? JSON.parse(_session) : null
    }
    logOut() {
        const _confirm = new Dialog("Está seguro(a) que quiere cerrar sesión", "Confirmación de usuario", Dialog.type.question)
        _confirm.on.done = () => {
            this.context.$cookies.remove(DEFAULT_SESSION_VAR)
            localStorage.removeItem(DEFAULT_SESSION_VAR)
            location.reload(true)
        }
        _confirm.open()
    }
}
export default Session