/**
 * 图片组件
 */

import * as React from "react";
import addDomEventListener from '../utils/addDomEventListener';

export interface ImageProps {
    radio?: number;
    src: string;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    zoomable?: boolean;
    dragable?: boolean;
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => any;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => any;
    onMouseDown?: (target: any, e: MouseEvent) => any;
    onMouseMove?: (target: any, e: MouseEvent) => any;
    onMouseUp?: (target: any, e: MouseEvent) => any;
    onMouseEnter?: (target: any, e: MouseEvent) => any;
    onMouseLeave?: (target: any, e: MouseEvent) => any;
    onZoomChange?: (zoom: number) => any;
    refs?: (refs: object) => any;
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => any;
}

interface ImageState {
    error: boolean;
}

export interface ImageRefProps {
    zoomIn: (step?: number) => any;
    zoomOut: (step?: number) => any;
    zoomSuit: () => any;
    zoomDefault: () => any;
    moveLeft: (step?: number) => any;
    moveRight: (step?: number) => any;
    moveTop: (step?: number) => any;
    moveBottom: (step?: number) => any;
}

export interface ImageMouseTarget {
    x: number;
    y: number;
    width: number;
    height: number;
}

class Image extends React.Component<ImageProps, ImageState> {
    refs: {
        wrapper: HTMLDivElement,
        image: HTMLDivElement,
        img: HTMLImageElement
    }
    static defaultProps = {
        dragable: false,
        zoomable: false
    };
    private moving: boolean = false; // 图片是否移动
    private container_width: number = 0; // 容器宽度
    private container_height: number = 0;// 容器高度
    private image_width: number = 0; // 图片实际宽度
    private image_height: number = 0; // 图片实际高度
    private origin_X: number = 0;// 鼠标按下后初始位置
    private origin_Y: number = 0;

    private domMouseUp: any;
    private mouseDown: any;
    private mouseMove: any;
    private mouseUp: any;
    private mouseWheel: any;
    private mouseEnter: any;
    private mouseLeave: any;

    /**
     * 获取容器边框宽度
     * @param wrapper 
     */
    static getWrapperBorderWidth(wrapper: HTMLDivElement): number {
        let borderWidth: number = 0;
        if (wrapper && wrapper.style && wrapper.style.borderWidth) {
            let _borderWidth = wrapper.style.borderWidth;
            borderWidth = typeof _borderWidth === 'string' ? parseFloat(_borderWidth) : _borderWidth;
        }
        return borderWidth * 2;
    }
    /**
     * 鼠标点击相对于浏览器偏移量
     * @param e 
     * @param image 
     */
    static getOffset(e: MouseEvent, image: HTMLDivElement): { offsetX: number, offsetY: number } {
        const mouseX: number = e.pageX || e.clientX;
        const mouseY: number = e.pageY || e.clientY;
        const boundingClientRect: ClientRect = image.getBoundingClientRect();
        const offsetX: number = mouseX - boundingClientRect.left - (window.pageXOffset || document.documentElement.scrollLeft);
        const offsetY: number = mouseY - boundingClientRect.top - (window.pageYOffset || document.documentElement.scrollTop);
        return { offsetX, offsetY };
    }
    /**
     * 偏移量百分比
     * @param e 
     * @param image 
     */
    static getOffsetXY(e: MouseEvent, image: HTMLDivElement): ImageMouseTarget {
        const { offsetX, offsetY } = Image.getOffset(e, image);
        const { width, height } = image.style;
        const _width: number = (typeof width === 'string' ? parseFloat(width) : width) || 0;
        const _height: number = (typeof height === 'string' ? parseFloat(height) : height) || 0;
        return {
            x: _width ? offsetX / _width : 0,
            y: _height ? offsetY / _height : 0,
            width: _width,
            height: _height
        }
    }
    /**
     * 图片实际大小
     * @param img 
     */
    static getImageSize(img: HTMLImageElement): { width: number, height: number } {
        if (img) {
            img.style.width = 'auto';
            img.style.height = 'auto';
            let width = img.width,
                height = img.height;
            img.style.width = '100%';
            img.style.height = '100%';
            return { width, height }
        }
        return {
            width: 0,
            height: 0
        }
    }

    zoomChange(step: number, offsetX: number, offsetY: number) {
        const { zoomable } = this.props;
        const { error } = this.state;
        if (!zoomable || error) return;
        const { image, wrapper } = this.refs;
        let width = image.style.width && (typeof image.style.width === 'string' ? parseFloat(image.style.width) : image.style.width) || 0;
        let height = image.style.height && (typeof image.style.height === 'string' ? parseFloat(image.style.height) : image.style.height) || 0;
        let left = image.style.left && (typeof image.style.left === 'string' ? parseFloat(image.style.left) : image.style.left) || 0;
        let top = image.style.top && (typeof image.style.top === 'string' ? parseFloat(image.style.top) : image.style.top) || 0;
        let zoom = width * (step + 1) / this.image_width;
        if (step < 0 && zoom < .1 || step > 0 && zoom > 5) return;
        let wrapperWidth = wrapper.style.width && (typeof wrapper.style.width === 'string' ? parseFloat(wrapper.style.width) : wrapper.style.width) || 0;
        let wrapperHeight = wrapper.style.height && (typeof wrapper.style.height === 'string' ? parseFloat(wrapper.style.height) : wrapper.style.height) || 0;
        let imageWidth = width * (1 + step);
        let imageHeight = height * (1 + step);
        let max_left = wrapperWidth - imageWidth;
        let max_top = wrapperHeight - imageHeight;
        let min_left = Math.min(max_left, 0);
        let min_top = Math.min(max_top, 0);
        max_left = Math.max(0, max_left);
        max_top = Math.max(0, max_top);
        image.style.width = imageWidth + 'px';
        image.style.height = imageHeight + 'px';
        let curLeft = left - offsetX * step;
        let curTop = top - offsetY * step;
        curLeft = Math.min(Math.max(min_left, curLeft), max_left);
        curTop = Math.min(Math.max(min_top, curTop), max_top);
        image.style.left = curLeft + 'px';
        image.style.top = curTop + 'px';
        const { onZoomChange } = this.props;
        onZoomChange && onZoomChange(zoom);
    }
    zoomOut(step?: number) {
        step = step ? Math.abs(step) : 0.1;
        this.zoomChange(-step, this.container_width / 2, this.container_height / 2);
    }
    zoomIn(step?: number) {
        step = step ? Math.abs(step) : 0.1;
        this.zoomChange(step, this.container_width / 2, this.container_height / 2);
    }
    zoomSuit() {
        const { error } = this.state;
        if (error) return;
        this.resizeImage(this.refs.img, this.props);
    }
    zoomDefault() {
        const { image } = this.refs;
        image.style.width = this.image_width + 'px';
        image.style.height = this.image_height + 'px';
        image.style.left = (this.container_width - this.image_width) / 2 + 'px';
        image.style.top = (this.container_height - this.image_height) / 2 + 'px';
        const { onZoomChange } = this.props;
        onZoomChange && onZoomChange(1);
    }
    moveLeft(step?: number) {
        const { dragable } = this.props;
        if(!dragable || error) return;
        step = step ? Math.abs(step) : 0.01;
        const { wrapper, image } = this.refs;
        let wrapperWidth = wrapper.style.width && (typeof wrapper.style.width === 'string' ? parseFloat(wrapper.style.width) : wrapper.style.width) || 0,
            imageWidth = image.style.width && (typeof image.style.width === 'string' ? parseFloat(image.style.width) : image.style.width) || 0,
            imageLeft = image.style.left && (typeof image.style.left === 'string' ? parseFloat(image.style.left) : image.style.left) || 0;
        let max_left = wrapperWidth - imageWidth;
        let min_left = Math.min(max_left, 0);
        max_left = Math.max(0, max_left);
        let curLeft = imageLeft - this.container_width * step;
        curLeft = Math.min(Math.max(min_left, curLeft), max_left);
        image.style.left = curLeft + 'px';
    }
    moveRight(step?: number) {
        const { dragable } = this.props;
        if(!dragable || error) return;
        step = step ? Math.abs(step) : 0.01;
        const { wrapper, image } = this.refs;
        let wrapperWidth = wrapper.style.width && (typeof wrapper.style.width === 'string' ? parseFloat(wrapper.style.width) : wrapper.style.width) || 0,
            imageWidth = image.style.width && (typeof image.style.width === 'string' ? parseFloat(image.style.width) : image.style.width) || 0,
            imageLeft = image.style.left && (typeof image.style.left === 'string' ? parseFloat(image.style.left) : image.style.left) || 0;
        let max_left = wrapperWidth - imageWidth;
        let min_left = Math.min(max_left, 0);
        max_left = Math.max(0, max_left);
        let curLeft = imageLeft + this.container_width * step;
        curLeft = Math.min(Math.max(min_left, curLeft), max_left);
        image.style.left = curLeft + 'px';
    }
    moveTop(step?: number) {
        const { dragable } = this.props;
        if(!dragable || error) return;
        step = step ? Math.abs(step) : 0.01;
        const { wrapper, image } = this.refs;
        let wrapperHeight = wrapper.style.height && (typeof wrapper.style.height === 'string' ? parseFloat(wrapper.style.height) : wrapper.style.height) || 0,
            imageHeight = image.style.height && (typeof image.style.height === 'string' ? parseFloat(image.style.height) : image.style.height) || 0,
            imageTop = image.style.top && (typeof image.style.top === 'string' ? parseFloat(image.style.top) : image.style.top) || 0;
        let max_top = wrapperHeight - imageHeight;
        let min_top = Math.min(max_top, 0);
        max_top = Math.max(0, max_top);
        let curTop = imageTop - this.container_height * step;
        curTop = Math.min(Math.max(min_top, curTop), max_top);
        image.style.top = curTop + 'px';
    }
    moveBottom(step?: number) {
        const { dragable } = this.props;
        if(!dragable || error) return;
        step = step ? Math.abs(step) : 0.01;
        const { wrapper, image } = this.refs;
        let wrapperHeight = wrapper.style.height && (typeof wrapper.style.height === 'string' ? parseFloat(wrapper.style.height) : wrapper.style.height) || 0,
            imageHeight = image.style.height && (typeof image.style.height === 'string' ? parseFloat(image.style.height) : image.style.height) || 0,
            imageTop = image.style.top && (typeof image.style.top === 'string' ? parseFloat(image.style.top) : image.style.top) || 0;
        let max_top = wrapperHeight - imageHeight;
        let min_top = Math.min(max_top, 0);
        max_top = Math.max(0, max_top);
        let curTop = imageTop + this.container_height * step;
        curTop = Math.min(Math.max(min_top, curTop), max_top);
        image.style.top = curTop + 'px';
    }
    constructor(props: ImageProps) {
        super(props);
        this.state = {
            error: false
        };
    }
    componentDidMount() {
        const { image } = this.refs;
        !this.domMouseUp && (this.domMouseUp = addDomEventListener(document, 'mouseup', () => {
            this.moving = false;
        }))
        !this.mouseDown && (this.mouseDown = addDomEventListener(image, 'mousedown', this.mouseDownHandler.bind(this)));
        !this.mouseMove && (this.mouseMove = addDomEventListener(image, 'mousemove', this.mouseMoveHandler.bind(this)));
        !this.mouseUp && (this.mouseUp = addDomEventListener(image, 'mouseup', this.mouseUpHandler.bind(this)));
        !this.mouseWheel && (this.mouseWheel = addDomEventListener(image, 'mousewheel', this.mouseWheelHandler.bind(this)));
        !this.mouseEnter && (this.mouseEnter = addDomEventListener(image, 'mouseenter', this.mouseEnterHandler.bind(this)));
        !this.mouseLeave && (this.mouseLeave = addDomEventListener(image, 'mouseleave', this.mouseLeaveHandler.bind(this)));

        let imageRefs: ImageRefProps = {
            zoomIn: (step) => this.zoomIn(step),
            zoomOut: (step) => this.zoomOut(step),
            zoomSuit: () => this.zoomSuit(),
            zoomDefault: () => this.zoomDefault(),
            moveLeft: (step) => this.moveLeft(step),
            moveRight: (step) => this.moveRight(step),
            moveTop: (step) => this.moveTop(step),
            moveBottom: (step) => this.moveBottom(step)
        }
        this.props.refs && this.props.refs(imageRefs)
    }
    componentWillReceiveProps(nextProps: ImageProps) {
        const { src } = nextProps;
        if (src === this.props.src) {
            this.resizeImage(this.refs.img, nextProps);
        }
        if (src && src !== this.props.src) {
            this.setState({ error: false })
        }
    }
    shouldComponentUpdate(_nextProps: ImageProps, nextState: ImageState) {
        return nextState.error != this.state.error;
    }
    componentWillUnmount() {
        this.domMouseUp && this.domMouseUp.remove();
        this.mouseDown && this.mouseDown.remove();
        this.mouseMove && this.mouseMove.remove();
        this.mouseUp && this.mouseUp.remove();
        this.mouseWheel && this.mouseWheel.remove();
        this.mouseEnter && this.mouseEnter.remove();
        this.mouseLeave && this.mouseLeave.remove();
    }
    mouseDownHandler(e: MouseEvent) {
        e.preventDefault();
        const { onMouseDown } = this.props;
        onMouseDown && onMouseDown(Image.getOffsetXY(e, this.refs.image), e);
        const { dragable } = this.props;
        const { error } = this.state;
        if (!dragable || error) return;
        this.moving = true;
        this.origin_X = e.pageX || e.clientX;
        this.origin_Y = e.pageY || e.clientY;
    }
    mouseMoveHandler(e: MouseEvent) {
        e.preventDefault();
        const { onMouseMove } = this.props;
        onMouseMove && onMouseMove(Image.getOffsetXY(e, this.refs.image), e);
        const { dragable } = this.props;
        const { error } = this.state;
        if (!dragable || error) return;
        if (this.moving) {
            const x = e.pageX || e.clientX;
            const y = e.pageY || e.clientY;
            const stepX = x - this.origin_X;
            const stepY = y - this.origin_Y;
            if (Math.abs(stepX) < 5 && Math.abs(stepY) < 5) return;
            this.origin_X = x;
            this.origin_Y = y;
            const { wrapper, image } = this.refs;
            let wrapperWidth = wrapper.style.width && (typeof wrapper.style.width === 'string' ? parseFloat(wrapper.style.width) : wrapper.style.width) || 0;
            let wrapperHeight = wrapper.style.height && (typeof wrapper.style.height === 'string' ? parseFloat(wrapper.style.height) : wrapper.style.height) || 0;
            let imageWidth = image.style.width && (typeof image.style.width === 'string' ? parseFloat(image.style.width) : image.style.width) || 0;
            let imageHeight = image.style.height && (typeof image.style.height === 'string' ? parseFloat(image.style.height) : image.style.height) || 0;
            let max_left = wrapperWidth - imageWidth;
            let max_top = wrapperHeight - imageHeight;
            let min_left = Math.min(max_left, 0);
            let min_top = Math.min(max_top, 0);
            max_left = Math.max(0, max_left);
            max_top = Math.max(0, max_top);
            let imageLeft = image.style.left && (typeof image.style.left === 'string' ? parseFloat(image.style.left) : image.style.left) || 0;
            let imageTop = image.style.top && (typeof image.style.top === 'string' ? parseFloat(image.style.top) : image.style.top) || 0;
            let curLeft = imageLeft + stepX;
            let curTop = imageTop + stepY;
            curLeft = Math.min(Math.max(min_left, curLeft), max_left);
            curTop = Math.min(Math.max(min_top, curTop), max_top);
            image.style.left = curLeft + 'px';
            image.style.top = curTop + 'px';
        }
    }
    mouseUpHandler(e: MouseEvent) {
        e.preventDefault();
        const { onMouseUp } = this.props;
        onMouseUp && onMouseUp(Image.getOffsetXY(e, this.refs.image), e);
        this.moving = false;
    }
    mouseWheelHandler(e: WheelEvent) {
        const { offsetX, offsetY } = Image.getOffset(e, this.refs.image);
        const step = e.deltaY / 1000;
        const { dragable } = this.props;
        this.zoomChange(-step, dragable ? offsetX : this.container_width / 2, dragable ? offsetY : this.container_height / 2);
    }
    mouseEnterHandler(e: MouseEvent) {
        const { onMouseEnter } = this.props;
        onMouseEnter && onMouseEnter(Image.getOffsetXY(e, this.refs.image), e);
    }
    mouseLeaveHandler(e: MouseEvent) {
        const { onMouseLeave } = this.props;
        onMouseLeave && onMouseLeave(Image.getOffsetXY(e, this.refs.image), e);
    }
    resizeImage(img: HTMLImageElement, props: ImageProps) {
        const imageSize = Image.getImageSize(img);
        this.image_width = imageSize.width;
        this.image_height = imageSize.height;
        const border_width: number = Image.getWrapperBorderWidth(this.refs.wrapper);
        const { width, height, style } = props;
        let container_width: number =
            width ||
            (style && (typeof style.width === 'string' ? parseFloat(style.width) : style.width)) ||
            0;
        let container_height: number =
            height ||
            (style && (typeof style.height === 'string' ? parseFloat(style.height) : style.height)) ||
            0;

        let _radio: number = 0;
        if (this.image_width && this.image_height) {
            _radio = this.image_width / this.image_height;
            const { radio } = props;
            if (!container_width && !container_height) { container_height = this.image_height; container_width = this.image_width; }
            if (!container_height) container_height = container_width * (radio != null ? (1 / radio) : (_radio > 1 ? 0.5626 : 1 / 0.5625));
            if (!container_width) container_width = container_height * (radio != null ? radio : (_radio > 1 ? 1 / 0.75 : 0.75));
        }
        this.container_width = Math.max(0, container_width - border_width);
        this.container_height = Math.max(0, container_height - border_width);
        let radio: number = 0;
        if (this.container_width && this.container_height) {
            radio = this.container_width / this.container_height;
        }
        let show_width = this.image_width,
            show_height = this.image_height,
            left = 0,
            top = 0;

        if (this.container_width >= show_width && this.container_height >= show_height) {
            left = (this.container_width - show_width) / 2;
            top = (this.container_height - show_height) / 2;
        } else {
            if (_radio > radio) {
                show_height = this.container_width / _radio;
                show_width = this.container_width;
                top = (this.container_height - show_height) / 2;
            } else {
                show_width = this.container_height * _radio;
                show_height = this.container_height;
                left = (this.container_width - show_width) / 2;
            }
        }
        const { wrapper, image } = this.refs;
        wrapper.style.width = this.container_width + 'px';
        wrapper.style.height = this.container_height + 'px';
        if (img) {
            image.style.width = show_width + 'px';
            image.style.height = show_height + 'px';
            image.style.top = top + 'px';
            image.style.left = left + 'px';
            img.style.visibility = 'visible';
        }
        const { onZoomChange } = props;
        onZoomChange && onZoomChange(this.image_width / this.container_width);
    }
    onLoad(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
        this.resizeImage(e.currentTarget, this.props);
        this.props.onLoad && this.props.onLoad(e);
    }
    onError(e: React.SyntheticEvent<HTMLImageElement, Event>): void {
        this.setState({ error: true }, () => {
            const { wrapper, image } = this.refs;
            const { width, height, style, radio } = this.props;
            const border_width = Image.getWrapperBorderWidth(wrapper);
            let container_width =
                width ||
                (style && (typeof style.width === 'string' ? parseFloat(style.width) : style.width)) ||
                0;
            let container_height =
                height ||
                (style && (typeof style.height === 'string' ? parseFloat(style.height) : style.height)) ||
                0;
            if (!container_height) container_height = container_width * (radio != null ? (1 / radio) : 0.5626);
            if (!container_width) container_width = container_height / (radio != null ? radio : 0.75);
            this.container_width = container_width - border_width;
            this.container_height = container_height - border_width;
            wrapper.style.width = this.container_width + 'px';
            wrapper.style.height = this.container_height + 'px';
            image.style.top = '0px';
            image.style.left = '0px';
        })
        this.props.onError && this.props.onError(e);
    }
    render() {
        const { error } = this.state;
        const { src, className, style, children } = this.props;
        return (
            <div
                onClick={this.props.onClick}
                ref="wrapper"
                className={className}
                style={{ ...style, position: 'relative', boxSizing: 'content-box', overflow: 'hidden' }}>
                <div ref="image" style={{
                    position: 'absolute'
                }}>
                    {!error && (
                        <img
                            style={{ position: 'relative', zIndex: 1, visibility: 'hidden', userSelect: 'none' }}
                            ref="img"
                            src={src}
                            onLoad={this.onLoad.bind(this)}
                            onError={this.onError.bind(this)}
                        />
                    )}
                    <div style={{ position: 'absolute', zIndex: 2, top: 0, left: 0, bottom: 0, right: 0 }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default Image;
