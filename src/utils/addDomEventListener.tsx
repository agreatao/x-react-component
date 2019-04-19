function addDomEventListener(target: HTMLElement | Document, eventType: string, callback: (e: Event) => void, capture?: boolean): { remove: () => void; } | null {
    function eventCallback(e: Event) {
        callback && callback.call(target, e);
    }
    if (target && target.addEventListener) {
        target.addEventListener(eventType, eventCallback, capture || false);
        return {
            remove() {
                target.removeEventListener(eventType, eventCallback, capture);
            }
        }
    }
    return null;
}

export default addDomEventListener;