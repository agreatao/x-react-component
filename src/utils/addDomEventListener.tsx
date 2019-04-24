import { EventMap } from '../types/eventTypes';

export type DomEvent = { remove: () => void; } | null;
export type DomEventOption = { capture?: boolean; once?: boolean; passive?: boolean; } | boolean;

export default function addDomEventListener
    <T extends HTMLElement | Document, ET extends keyof EventMap<T>>
    (
        target: T,
        eventType: ET,
        callback: (e: EventMap<T>[ET]) => any,
        option?: DomEventOption
    ): DomEvent {

    function eventCallback(e: any) {
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
