export function shakeElem(elem: HTMLElement) {
    if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        elem.focus()
        setTimeout(() => {
            elem.classList.add('headShake-animation', 'border-destructive')
            setTimeout(() => {
                elem.classList.remove('headShake-animation', 'border-destructive')
            }, 1000)
        }, 1000)
    }
}