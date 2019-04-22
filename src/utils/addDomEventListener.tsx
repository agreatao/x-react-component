export interface DomEventListener {
    remove: () => void;
}

function addDomEventListener(
    target: HTMLElement | Document,
    eventType: string,
    callback: (e: React.MouseEvent<any> | React.WheelEvent<any>) => any,
    option?: boolean | any
): DomEventListener | null {
    function eventCallback(e: MouseEvent | WheelEvent) {
        callback && callback.call(target, e);
    }

    let useCapture = false;
    if (typeof option === 'object') {
        useCapture = option.capture || false;
    } else if (typeof option === 'boolean') {
        useCapture = option;
    }

    if (target && target.addEventListener) {
        target.addEventListener(eventType, eventCallback, option || false);
        return {
            remove() {
                target.removeEventListener(eventType, eventCallback, useCapture);
            }
        };
    }
    return null;
}

export default addDomEventListener;
