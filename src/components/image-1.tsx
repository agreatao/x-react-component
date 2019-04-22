import React from "react";
import classnames from "classnames";
import addDomEventListener, {
    DomEventListener
} from "../utils/addDomEventListener";

export interface MoveProp {
    enable: boolean;
}

export interface ZoomProp {
    enable: boolean;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
}

export interface ImageRef {
    zoomIn: (step?: number) => any;
    zoomOut: (step?: number) => any;
    zoomSuit: () => any;
    zoomDefault: () => any;
    moveTop: (step?: number) => any;
    moveBottom: (step?: number) => any;
    moveLeft: (step?: number) => any;
    moveRight: (step?: number) => any;
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

export interface ImageProp {
    src: string;
    radio?: number;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    border?: boolean;
    inline?: boolean;
    move?: boolean | MoveProp;
    zoom?: boolean | ZoomProp;
    refs?: (image: ImageRef) => any;
    onZoomChange?: (zoom: number) => any;
    onMouseDown?: (
        eventTarget: ImageEventTarget,
        e: React.MouseEvent<HTMLDivElement>
    ) => any;
    onMouseMove?: (
        eventTarget: ImageEventTarget,
        e: React.MouseEvent<HTMLDivElement>
    ) => any;
    onMouseUp?: (
        eventTarget: ImageEventTarget,
        e: React.MouseEvent<HTMLDivElement>
    ) => any;
    onMouseEnter?: (
        eventTarget: ImageEventTarget,
        e: React.MouseEvent<HTMLDivElement>
    ) => any;
    onMouseLeave?: (
        eventTarget: ImageEventTarget,
        e: React.MouseEvent<HTMLDivElement>
    ) => any;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => any;
    onLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => any;
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => any;
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

class Image extends React.Component<ImageProp, ImageState> {
    static canMove(props: ImageProp): boolean {
        const { move } = props;
        return typeof move === "boolean"
            ? move
            : typeof move === "object" && move.enable;
    }

    static canZoom(props: ImageProp): boolean {
        const { zoom } = props;
        return typeof zoom === "boolean"
            ? zoom
            : typeof zoom === "object" && zoom.enable;
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

    static getSize(
        props: ImageProp,
        { imageWidth, imageHeight }: ImageSize,
        suit?: boolean,
        biggerSuit?: boolean
    ): ImageState {
        const { width, height, border, radio } = props;
        let containerWidth = 0,
            containerHeight = 0,
            showWidth = imageWidth,
            showHeight = imageHeight,
            showLeft = 0,
            showTop = 0;

        let __radio = (imageHeight && imageWidth / imageHeight) || 0;

        containerWidth =
            width || (height && height * (radio ? radio : 0.75)) || imageWidth;
        containerHeight =
            height || (width && width / (radio ? radio : 0.75)) || imageHeight;

        containerWidth = containerWidth - (border ? 2 : 0);
        containerHeight = containerHeight - (border ? 2 : 0);
        let _radio = (containerHeight && containerWidth / containerHeight) || 0;

        if (
            suit ||
            (biggerSuit &&
                (containerWidth < imageWidth || containerHeight < imageHeight))
        ) {
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

        return {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        };
    }

    static getMouseOffset(
        e: React.MouseEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>
    ): MouseOffset {
        const mouseX = e.pageX || e.clientX;
        const mouseY = e.pageY || e.clientY;
        const boundingClientRect = e.currentTarget.getBoundingClientRect();
        const offsetX =
            mouseX -
            boundingClientRect.left -
            (window.pageXOffset || document.documentElement.scrollLeft);
        const offsetY =
            mouseY -
            boundingClientRect.top -
            (window.pageYOffset || document.documentElement.scrollTop);
        return { offsetX, offsetY };
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

    private documentMouseUp: DomEventListener | null;
    private documentMouseMove: DomEventListener | null;

    static defaultProps = {
        inline: false,
        border: false,
        move: false,
        zoom: false
    };

    constructor(props: ImageProp) {
        super(props);

        const { zoom } = props;
        if (typeof zoom === "object") {
            this.minWidth = (zoom && zoom.minWidth) || 0;
            this.maxWidth = (zoom && zoom.maxWidth) || 0;
            this.minHeight = (zoom && zoom.minHeight) || 0;
            this.maxHeight = (zoom && zoom.maxHeight) || 0;
        }

        const {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showTop,
            showLeft
        } = Image.getSize(props, { imageWidth: 0, imageHeight: 0 });
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

    resetImage(
        props: ImageProp,
        suit?: boolean,
        biggerSuit?: boolean
    ): ImageState {
        let {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        } = Image.getSize(
            props,
            {
                imageWidth: this.imageWidth,
                imageHeight: this.imageHeight
            },
            suit,
            biggerSuit
        );
        let _left = containerWidth - showWidth,
            _top = containerHeight - showHeight;
        this.minLeft = Math.min(0, _left);
        this.maxLeft = Math.max(0, _left);
        this.minTop = Math.min(0, _top);
        this.maxTop = Math.max(0, _top);

        this.props.onZoomChange &&
            this.props.onZoomChange(showWidth / this.imageWidth);
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
        if (typeof zoom === "object") {
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
    }

    zoom(step: number, offsetX: number, offsetY: number) {
        const { error } = this.state;
        if (!Image.canZoom(this.props) || error) return;
        let {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        } = this.state;
        let currentWidth = showWidth,
            currentHeight = showHeight;
        let currentZoom = showWidth / this.imageWidth;
        currentZoom = currentZoom + step;
        showWidth = this.imageWidth * currentZoom;
        showHeight = this.imageHeight * currentZoom;
        if (
            showWidth < this.minWidth ||
            showWidth > this.maxWidth ||
            showHeight < this.minHeight ||
            showHeight > this.maxHeight
        )
            return;

        let _left = containerWidth - showWidth,
            _top = containerHeight - showHeight;
        this.minLeft = Math.min(0, _left);
        this.maxLeft = Math.max(0, _left);
        this.minTop = Math.min(0, _top);
        this.maxTop = Math.max(0, _top);

        showLeft =
            showLeft -
            (showWidth - currentWidth) / 2 -
            (currentWidth / 2 - offsetX);
        showTop =
            showTop -
            (showHeight - currentHeight) / 2 -
            (currentHeight / 2 - offsetY);

        showLeft = Math.max(this.minLeft, Math.min(this.maxLeft, showLeft));
        showTop = Math.max(this.minTop, Math.min(this.maxTop, showTop));

        this.setState({
            showWidth,
            showHeight,
            showLeft,
            showTop
        });

        this.props.onZoomChange &&
            this.props.onZoomChange(showWidth / this.imageWidth);
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
        const {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        } = this.resetImage(this.props, true);
        this.setState({
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        });
    }

    zoomDefault() {
        const {
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        } = this.resetImage(this.props, false);
        this.setState({
            containerWidth,
            containerHeight,
            showWidth,
            showHeight,
            showLeft,
            showTop
        });
    }

    moveLeft(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showLeft } = this.state;
        showLeft = Math.max(
            this.minLeft,
            Math.min(this.maxLeft, showLeft - step)
        );
        this.setState({ showLeft });
    }

    moveRight(step?: number) {
        if (!Image.canMove(this.props)) return;
        step = step ? Math.abs(step) : 10;
        let { showLeft } = this.state;
        showLeft = Math.max(
            this.minLeft,
            Math.min(this.maxLeft, showLeft + step)
        );
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

    move(e: React.MouseEvent<HTMLElement> | MouseEvent) {
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
            showLeft = Math.max(
                this.minLeft,
                Math.min(this.maxLeft, showLeft + stepX)
            );
            showTop = Math.max(
                this.minTop,
                Math.min(this.maxTop, showTop + stepY)
            );
            this.setState({ showLeft, showTop });
        }
    }

    componentDidMount() {
        this.documentMouseUp = addDomEventListener(
            document,
            "mouseup",
            () => (this.moving = false)
        );
        this.documentMouseMove = addDomEventListener(
            document,
            "mousemove",
            e => {
                e.preventDefault();
                const { error } = this.state;
                if (error) return;
                this.move(e);
            }
        );

        this.props.refs &&
            this.props.refs({
                zoomIn: this.zoomIn.bind(this),
                zoomOut: this.zoomOut.bind(this),
                zoomSuit: this.zoomSuit.bind(this),
                zoomDefault: this.zoomDefault.bind(this),
                moveLeft: this.moveLeft.bind(this),
                moveRight: this.moveRight.bind(this),
                moveTop: this.moveTop.bind(this),
                moveBottom: this.moveBottom.bind(this)
            });
    }

    componentWillUnmount() {
        this.documentMouseUp && this.documentMouseUp.remove();
        this.documentMouseMove && this.documentMouseMove.remove();
    }

    componentWillReceiveProps(nextProps: ImageProp) {
        const { src, width, height } = nextProps;
        if (src && src !== this.props.src) {
            this.setState({ error: false, loaded: false });
        }
        if (
            src === this.props.src &&
            (width !== this.props.width || height !== this.props.height)
        ) {
            const {
                containerWidth,
                containerHeight,
                showWidth,
                showHeight,
                showTop,
                showLeft
            } = this.resetImage(nextProps, false, true);

            this.setState({
                containerWidth,
                containerHeight,
                showWidth,
                showHeight,
                showTop,
                showLeft
            });
        }
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
        this.props.onLoad && this.props.onLoad(e);
    }

    imageErrorHandler(e: React.SyntheticEvent<HTMLImageElement, Event>) {
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
        this.props.onError && this.props.onError(e);
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

    wheelHandler(e: React.WheelEvent<HTMLDivElement>) {
        const { showWidth, showHeight } = this.state;
        const { offsetX, offsetY } = Image.getMouseOffset(e);
        this.zoom(
            -e.deltaY,
            Image.canMove(this.props) ? offsetX : showWidth / 2,
            Image.canMove(this.props) ? offsetY : showHeight / 2
        );
    }

    render() {
        const { src, children, border, inline, className, style } = this.props;
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
                    "xrc-image",
                    {
                        "image-border": border
                    },
                    className
                )}
                style={{
                    ...style,
                    display: inline ? "inline-block" : "block",
                    boxSizing: "content-box",
                    position: "relative",
                    overflow: "hidden",
                    width: containerWidth,
                    height: containerHeight,
                    borderWidth: border ? 1 : undefined
                }}
                onClick={this.props.onClick}
            >
                <div
                    style={{
                        position: "absolute",
                        width: showWidth,
                        height: showHeight,
                        top: showTop,
                        left: showLeft
                    }}
                    onMouseDown={this.mouseDownHandler.bind(this)}
                    onMouseMove={this.mouseMoveHandler.bind(this)}
                    onMouseUp={this.mouseUpHandler.bind(this)}
                    onMouseEnter={this.mouseEnterHandler.bind(this)}
                    onMouseLeave={this.mouseLeaveHandler.bind(this)}
                    onWheel={this.wheelHandler.bind(this)}
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

export default Image;
