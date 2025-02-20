export default function getUser () {
    const user = localStorage.getItem('user')
    return user !== null;
}