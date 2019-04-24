import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import addDomEventListener, { DomEvent } from "../utils/addDomEventListener";

export interface ImageMoveProps {
    enable: boolean;
}

export interface ImageZoomProps {
    enable: boolean;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

export interface ImageRefs {
    zoomIn: (step?: number) => any;
    zoomOut: (step?: number) => any;
    zoomSuit: () => any;
    zoomDefault: () => any;
    moveTop: (step?: number) => any;
    moveBottom: (step?: number) => any;
    moveLeft: (step?: number) => any;
    moveRight: (step?: number) => any;
    download: () => any;
}

export interface ImageEventTarget {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    x: number;
    y: number;
    zoom: number;
}

export interface ImageProps {
    src?: string;
    radio?: number;
    width?: number;
    height?: number;
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    move?: boolean | Partial<ImageMoveProps>;
    zoom?: boolean | Partial<ImageZoomProps>;
    refs?: (image?: ImageRefs) => any;
    onZoomChange?: (zoom?: number) => any;
    onMouseDown?: (eventTarget?: ImageEventTarget, e?: React.MouseEvent<HTMLDivElement>) => any;
    onMouseMove?: (eventTarget?: ImageEventTarget, e?: React.MouseEvent<HTMLDivElement>) => any;
    onMouseUp?: (eventTarget?: ImageEventTarget, e?: React.MouseEvent<HTMLDivElement>) => any;
    onMouseEnter?: (eventTarget?: ImageEventTarget, e?: React.MouseEvent<HTMLDivElement>) => any;
    onMouseLeave?: (eventTarget?: ImageEventTarget, e?: React.MouseEvent<HTMLDivElement>) => any;
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => any;
    onLoad?: () => any;
    onError?: () => any;
}

export interface ImageState {
    error?: boolean;
    loaded?: boolean;
    containerWidth: number;
    containerHeight: number;
    showWidth: number;
    showHeight: number;
    showTop: number;
    showLeft: number;
}

export interface ImageSize {
    imageWidth: number;
    imageHeight: number;
}

export interface MouseOffset {
    offsetX: number;
    offsetY: number;
}

export default class Image extends React.Component<ImageProps, ImageState> {

    static defaultProps = {
        prefixCls: 'xrc',
        radio: 0.75,
        move: false,
        zoom: false
    };

    static propTypes = {
        src: PropTypes.string,
        radio: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        prefixCls: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        children: PropTypes.any,
        move: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.shape({
                enable: PropTypes.bool
            })
        ]),
        zoom: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.shape({
                enable: PropTypes.bool,
                minWidth: PropTypes.number,
                maxWidth: PropTypes.number,
                minHeight: PropTypes.number,
                maxHeight: PropTypes.number
            })
        ]),
        refs: PropTypes.func,
        onZoomChange: PropTypes.func,
        onMouseDown: PropTypes.func,
        onMouseMove: PropTypes.func,
        onMouseUp: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onClick: PropTypes.func,
        onLoad: PropTypes.func,
        onError: PropTypes.func
    }

    refs: {
        image: HTMLDivElement;
    }

    private imageWidth: number = 0;
    private imageHeight: number = 0;

    private originX: number = 0;
    private originY: number = 0;

    private minLeft: number = 0;
    private maxLeft: number = 0;
    private minTop: number = 0;
    private maxTop: number = 0;

    private minWidth: number;
    private maxWidth: number;
    private minHeight: number;
    private maxHeight: number;

    private moving: boolean = false;

    private documentMouseUp: DomEvent;
    private documentMouseMove: DomEvent;
    private imageMouseDown: DomEvent;
    private imageMouseMove: DomEvent;
    private imageMouseUp: DomEvent;
    private imageMouseEnter: DomEvent;
    private imageMouseLeave: DomEvent;
    private imageMouseWheel: DomEvent;

    static canMove(props: ImageProps): boolean {
        const { move } = props;
        return typeof move === "undefined" ? false :
            typeof move === "boolean" ? move :
                typeof move.enable !== "undefined" ? move.enable : true;
    }

    static canZoom(props: ImageProps): boolean {
        const { zoom } = props;
        return typeof zoom === "undefined" ? false :
            typeof zoom === "boolean" ? zoom :
                typeof zoom.enable !== "undefined" ? zoom.enable : true;
    }

    static getImageSize(img: HTMLImageElement): ImageSize {
        let imageWidth = 0,
            imageHeight = 0;
        if (img) {
            imageWidth = img.width;
            imageHeight = img.height;
        }
        return { imageWidth, imageHeight };
    }

    static getSize(props: ImageProps, { imageWidth, imageHeight }: ImageSize, suit?: boolean, biggerSuit?: boolean): ImageState {
        const { width, height, radio } = props;
        let containerWidth = 0, containerHeight = 0, showWidth = imageWidth, showHeight = imageHeight, showLeft = 0, showTop = 0;
        containerWidth = width || (height && height * (radio || 0.75)) || imageWidth;
        containerHeight = height || (width && width / (radio || 0.75)) || imageHeight;
        if (suit || (biggerSuit && (containerWidth < imageWidth || containerHeight < imageHeight))) {
            let __radio = (imageHeight && imageWidth / imageHeight) || 0;
            let _radio = (containerHeight && containerWidth / containerHeight) || 0;
            if (__radio > _radio) {
                showHeight = (__radio && containerWidth / __radio) || 0;
                showWidth = containerWidth;
            } else {
                showWidth = containerHeight * __radio;
                showHeight = containerHeight;
            }
        }
        showTop = (containerHeight - showHeight) / 2;
        showLeft = (containerWidth - showWidth) / 2;
        return { containerWidth, containerHeight, showWidth, showHeight, showTop, showLeft };
    }

    static getMouseOffset(e: React.MouseEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>): MouseOffset {
        const mouseX = e.pageX || e.clientX;
        const mouseY = e.pageY || e.clientY;
        const boundingClientRect = e.currentTarget.getBoundingClientRect();
        const offsetX = mouseX - boundingClientRect.left - (window.pageXOffset || document.documentElement.scrollLeft);
        const offsetY = mouseY - boundingClientRect.top - (window.pageYOffset || document.documentElement.scrollTop);
        return { offsetX, offsetY };
    }

    resetImage(props: ImageProps, suit?: boolean, biggerSuit?: boolean): ImageState {
        let { containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop } = Image.getSize(props, { imageWidth: this.imageWidth, imageHeight: this.imageHeight }, suit, biggerSuit);
        let _left = containerWidth - showWidth,
            _top = containerHeight - showHeight;
        this.minLeft = Math.min(0, _left);
        this.maxLeft = Math.max(0, _left);
        this.minTop = Math.min(0, _top);
        this.maxTop = Math.max(0, _top);
        this.props.onZoomChange && this.props.onZoomChange(showWidth / this.imageWidth);
        return {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        };
    }

    resetZoom() {
        const { zoom } = this.props;
        this.minWidth =
            (typeof zoom === "object" && zoom.minWidth) ||
            this.imageWidth / 5;
        this.maxWidth =
            (typeof zoom === "object" && zoom.maxWidth) ||
            this.imageWidth * 5;
        this.minHeight =
            (typeof zoom === "object" && zoom.minHeight) ||
            this.imageHeight / 5;
        this.maxHeight =
            (typeof zoom === "object" && zoom.maxHeight) ||
            this.imageHeight * 5;
    }

    zoom(step: number, offsetX: number, offsetY: number) {
        const { error } = this.state;
        if (!Image.canZoom(this.props) || error) return;
        let { containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop } = this.state;
        let currentWidth = showWidth,
            currentHeight = showHeight;
        let currentZoom = showWidth / this.imageWidth;
        currentZoom = currentZoom + step;
        showWidth = this.imageWidth * currentZoom;
        showHeight = this.imageHeight * currentZoom;
        if (showWidth < this.minWidth || showWidth > this.maxWidth || showHeight < this.minHeight || showHeight > this.maxHeight) return;
        let _left = containerWidth - showWidth,
            _top = containerHeight - showHeight;
        this.minLeft = Math.min(0, _left);
        this.maxLeft = Math.max(0, _left);
        this.minTop = Math.min(0, _top);
        this.maxTop = Math.max(0, _top);
        showLeft = showLeft - (showWidth - currentWidth) / 2 - (currentWidth / 2 - offsetX) + (showWidth / 2 - offsetX / currentWidth * showWidth);
        showTop = showTop - (showHeight - currentHeight) / 2 - (currentHeight / 2 - offsetY) + (showHeight / 2 - offsetY / currentHeight * showHeight);
        showLeft = Math.max(this.minLeft, Math.min(this.maxLeft, showLeft));
        showTop = Math.max(this.minTop, Math.min(this.maxTop, showTop));
        this.setState({
            showWidth,
            showHeight,
            showLeft,
            showTop
        });
        this.props.onZoomChange && this.props.onZoomChange(showWidth / this.imageWidth);
    }

    zoomIn(step?: number) {
        step = step ? Math.abs(step) : 0.1;
        const { showWidth, showHeight } = this.state;
        this.zoom(step, showWidth / 2, showHeight / 2);
    }

    zoomOut(step?: number) {
        step = step ? Math.abs(step) : 0.1;
        const { showWidth, showHeight } = this.state;
        this.zoom(-step, showWidth / 2, showHeight / 2);
    }

    zoomSuit() {
        const { error } = this.state;
        if (!Image.canZoom(this.props) || error) return;
        const { containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop } = this.resetImage(this.props, true);
        this.setState({ containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop });
    }

    zoomDefault() {
        const { error } = this.state;
        if (!Image.canZoom(this.props) || error) return;
        const { containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop } = this.resetImage(this.props, false);
        this.setState({ containerWidth, containerHeight, showWidth, showHeight, showLeft, showTop });
    }

    moveLeft(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showLeft } = this.state;
        showLeft = Math.max(this.minLeft, Math.min(this.maxLeft, showLeft - step));
        this.setState({ showLeft });
    }

    moveRight(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showLeft } = this.state;
        showLeft = Math.max(this.minLeft, Math.min(this.maxLeft, showLeft + step));
        this.setState({ showLeft });
    }

    moveTop(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showTop } = this.state;
        showTop = Math.max(this.minTop, Math.min(this.maxTop, showTop - step));
        this.setState({ showTop });
    }

    moveBottom(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showTop } = this.state;
        showTop = Math.max(this.minTop, Math.min(this.maxTop, showTop + step));
        this.setState({ showTop });
    }

    move<T extends HTMLElement | Document>(e: React.MouseEvent<T>) {
        if (!Image.canMove(this.props)) return;
        if (this.moving) {
            const x = e.pageX || e.clientX;
            const y = e.pageY || e.clientY;
            const stepX = x - this.originX;
            const stepY = y - this.originY;
            if (Math.abs(stepX) < 5 && Math.abs(stepY) < 5) return;
            this.originX = x;
            this.originY = y;
            let { showLeft, showTop } = this.state;
            showLeft = Math.max(this.minLeft, Math.min(this.maxLeft, showLeft + stepX));
            showTop = Math.max(this.minTop, Math.min(this.maxTop, showTop + stepY));
            this.setState({ showLeft, showTop });
        }
    }

    download() {
        const { src } = this.props;
        const { error } = this.state;
        if (src && !error) {
            let a = document.createElement('a');
            a.href = src; //图片地址
            a.download = new Date().getTime() + ""; //图片名及格式
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    }

    constructor(props: ImageProps) {
        super(props);
        const { containerWidth, containerHeight, showWidth, showHeight, showTop, showLeft } = Image.getSize(props, { imageWidth: 0, imageHeight: 0 });
        this.resetZoom();
        this.state = {
            error: false,
            loaded: false,
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        };
    }

    componentDidMount() {
        this.documentMouseUp = addDomEventListener(document, "mouseup", () => (this.moving = false));
        this.documentMouseMove = addDomEventListener(document, "mousemove", e => {
            e.preventDefault();
            const { error } = this.state;
            if (error) return;
            this.move(e);
        });

        const { image } = this.refs;

        this.imageMouseDown = addDomEventListener(image, "mousedown", this.mouseDownHandler.bind(this));
        this.imageMouseMove = addDomEventListener(image, "mousemove", this.mouseMoveHandler.bind(this));
        this.imageMouseUp = addDomEventListener(image, "mouseup", this.mouseUpHandler.bind(this));
        this.imageMouseEnter = addDomEventListener(image, "mouseenter", this.mouseEnterHandler.bind(this));
        this.imageMouseLeave = addDomEventListener(image, "mouseleave", this.mouseLeaveHandler.bind(this));
        this.imageMouseWheel = addDomEventListener(image, "wheel", this.mouseWheelHandler.bind(this), { passive: false });

        this.props.refs && this.props.refs({
            zoomIn: this.zoomIn.bind(this),
            zoomOut: this.zoomOut.bind(this),
            zoomSuit: this.zoomSuit.bind(this),
            zoomDefault: this.zoomDefault.bind(this),
            moveLeft: this.moveLeft.bind(this),
            moveRight: this.moveRight.bind(this),
            moveTop: this.moveTop.bind(this),
            moveBottom: this.moveBottom.bind(this),
            download: this.download.bind(this)
        });

        const { error } = this.state;
        if (error) {
            this.props.onZoomChange && this.props.onZoomChange(1);
            this.props.onError && this.props.onError();
        }
    }

    componentWillReceiveProps(nextProps: ImageProps) {
        const { src, width, height } = nextProps;
        if (src !== this.props.src) {
            if (src) {
                this.setState({ error: false, loaded: false });
            } else {
                this.setState({ error: true, loaded: false });
                this.props.onZoomChange && this.props.onZoomChange(1);
                this.props.onError && this.props.onError();
            }
        }
        if (src === this.props.src && (width !== this.props.width || height !== this.props.height)) {
            const { containerWidth, containerHeight, showWidth, showHeight, showTop, showLeft } = this.resetImage(nextProps, false, true);
            this.setState({ containerWidth, containerHeight, showWidth, showHeight, showTop, showLeft });
        }
    }

    componentWillUnmount() {
        this.documentMouseUp && this.documentMouseUp.remove();
        this.documentMouseMove && this.documentMouseMove.remove();
        this.imageMouseDown && this.imageMouseDown.remove();
        this.imageMouseMove && this.imageMouseMove.remove();
        this.imageMouseUp && this.imageMouseUp.remove();
        this.imageMouseEnter && this.imageMouseEnter.remove();
        this.imageMouseLeave && this.imageMouseLeave.remove();
        this.imageMouseWheel && this.imageMouseWheel.remove();
    }

    imageLoadHandler(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        const { imageWidth, imageHeight } = Image.getImageSize(e.currentTarget);
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        const {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        } = this.resetImage(this.props, false, true);
        this.resetZoom();
        this.setState({
            loaded: true,
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        });
        this.props.onLoad && this.props.onLoad();
    }

    imageErrorHandler(_e: React.SyntheticEvent<HTMLImageElement, Event>) {
        const {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        } = Image.getSize(this.props, { imageWidth: 0, imageHeight: 0 });
        this.setState({
            error: true,
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        });
        this.props.onError && this.props.onError();
    }

    getMouseEventTarget(e: React.MouseEvent<HTMLDivElement>): ImageEventTarget {
        const { offsetX, offsetY } = Image.getMouseOffset(e);
        const { showWidth, showHeight } = this.state;
        return {
            offsetX,
            offsetY,
            width: showWidth,
            height: showHeight,
            x: showWidth ? offsetX / showWidth : 0,
            y: showHeight ? offsetY / showHeight : 0,
            zoom: showWidth / this.imageWidth
        };
    }

    mouseDownHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const { error } = this.state;
        if (error) return;
        const eventTarget = this.getMouseEventTarget(e);
        this.props.onMouseDown && this.props.onMouseDown(eventTarget, e);
        if (!Image.canMove(this.props)) return;
        this.moving = true;
        this.originX = e.pageX || e.clientX;
        this.originY = e.pageY || e.clientY;
    }

    mouseMoveHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const { error } = this.state;
        if (error) return;
        const eventTarget = this.getMouseEventTarget(e);
        this.props.onMouseMove && this.props.onMouseMove(eventTarget, e);
        this.move(e);
    }

    mouseUpHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const { error } = this.state;
        if (error) return;
        const eventTarget = this.getMouseEventTarget(e);
        this.props.onMouseUp && this.props.onMouseUp(eventTarget, e);
        this.moving = false;
    }

    mouseEnterHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const { error } = this.state;
        if (error) return;
        const eventTarget = this.getMouseEventTarget(e);
        this.props.onMouseEnter && this.props.onMouseEnter(eventTarget, e);
    }

    mouseLeaveHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const { error } = this.state;
        if (error) return;
        const eventTarget = this.getMouseEventTarget(e);
        this.props.onMouseLeave && this.props.onMouseLeave(eventTarget, e);
    }

    mouseWheelHandler(e: React.WheelEvent<HTMLDivElement>) {
        e.preventDefault();
        const { showWidth, showHeight } = this.state;
        const { offsetX, offsetY } = Image.getMouseOffset(e);
        let step = e.deltaY;
        step = step / (Math.abs(step) > 100 ? 10000 : Math.abs(step) > 100 ? 100 : Math.abs(step) > 1 ? 100 : 10);
        this.zoom(
            -step,
            Image.canMove(this.props) ? offsetX : showWidth / 2,
            Image.canMove(this.props) ? offsetY : showHeight / 2
        );
        return false;
    }

    onClickHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        this.props.onClick && this.props.onClick(e);
    }

    render() {
        const { src, children, className, style, prefixCls } = this.props;
        const {
            error,
            loaded,

            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        } = this.state;
        return (
            <div
                className={classnames(
                    `${prefixCls}-image`,
                    className)}
                style={{
                    ...style,
                    boxSizing: "content-box",
                    position: "relative",
                    overflow: "hidden",
                    width: containerWidth,
                    height: containerHeight
                }}
                onClick={this.onClickHandler.bind(this)}
            >
                <div
                    style={{
                        position: "absolute",
                        width: showWidth,
                        height: showHeight,
                        top: showTop,
                        left: showLeft
                    }}
                    ref="image"
                >
                    {!error && (
                        <img
                            style={
                                loaded
                                    ? {
                                        width: "100%",
                                        height: "100%",
                                        visibility: "visible"
                                    }
                                    : {
                                        width: "auto",
                                        height: "auto",
                                        visibility: "hidden"
                                    }
                            }
                            src={src}
                            onLoad={this.imageLoadHandler.bind(this)}
                            onError={this.imageErrorHandler.bind(this)}
                        />
                    )}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: "hidden"
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}