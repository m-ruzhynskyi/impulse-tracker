export default function getUser () {
    const user = localStorage.getItem('user')
    if (!user) return false
    else {
        if (user === 'admin') return true
        else return false
    }
}