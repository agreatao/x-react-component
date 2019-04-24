export interface ClipboardEventMap<T> {
    "copy": React.ClipboardEvent<T>,
    "cut": React.ClipboardEvent<T>,
    "paste": React.ClipboardEvent<T>
}

// CompositionEventHandler

// DragEventHandler

// FocusEventHandler

// FormEventHandler

// ChangeEventHandler

export interface KeyboardEventMap<T> {
    "keydown": React.KeyboardEvent<T>,
    "keypress": React.KeyboardEvent<T>,
    "keyup": React.KeyboardEvent<T>
}

export interface MouseEventMap<T> {
    "click": React.MouseEvent<T>,
    "contextmenu": React.MouseEvent<T>,
    "dblclick": React.MouseEvent<T>,
    "mousedown": React.MouseEvent<T>,
    "mouseenter": React.MouseEvent<T>,
    "mouseleave": React.MouseEvent<T>,
    "mousemove": React.MouseEvent<T>,
    "mouseover": React.MouseEvent<T>,
    "mouseout": React.MouseEvent<T>,
    "mouseup": React.MouseEvent<T>
}

// TouchEventHandler

// PointerEventHandler

// UIEventHandler

export interface WheelEventMap<T> {
    "wheel": React.WheelEvent<T>
}

export interface AnimationEventMap<T> {
    "animationend": React.AnimationEvent<T>,
    "animationiteration": React.AnimationEvent<T>
    "animationstart": React.AnimationEvent<T>
}

export interface TransitionEventMap<T> {
    "transitionend": React.TransitionEvent<T>
}

export interface EventMap<T> extends
    ClipboardEventMap<T>,
    KeyboardEventMap<T>,
    MouseEventMap<T>,
    WheelEventMap<T>,
    AnimationEventMap<T>,
    TransitionEventMap<T> {
}