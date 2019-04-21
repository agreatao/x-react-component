export interface DomEventListener {
    remove: () => void;
}

function addDomEventListener(
    target: HTMLElement | Document,
    eventType: string,
    callback: (e: MouseEvent) => any,
    capture?: boolean
): DomEventListener | null {
    function eventCallback(e: MouseEvent) {
        callback && callback.call(target, e);
    }
    if (target && target.addEventListener) {
        target.addEventListener(eventType, eventCallback, capture || false);
        return {
            remove() {
                target.removeEventListener(eventType, eventCallback, capture);
            }
        };
    }
    return null;
}

export default addDomEventListener;
