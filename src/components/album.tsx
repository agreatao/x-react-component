import * as React from 'react';
import PropType from 'prop-types';
import classnames from 'classnames';
import Image, { ImageRefs } from './image';

export interface PreviewProps {
    enable: boolean;
    width: number;
    height: number;
    zoom: boolean;
    move: boolean;
    onZoomChange?: (zoom: number) => any;
}

export interface ControlProps {
    zoom: boolean;
    move: boolean;
    download: boolean;
    info: boolean;
}

export interface ImagesProps {
    src: any[];
    srcKey: string;
    showLength: number;
    width: number;
    height: number;
    interval: number;
}

export interface LocaleProps {
    imagePrev: React.ReactNode;
    imageNext: React.ReactNode;
    zoomIn: React.ReactNode;
    zoomOut: React.ReactNode;
    zoomSuit: React.ReactNode;
    zoomDefault: React.ReactNode;
    moveTop: React.ReactNode;
    moveBottom: React.ReactNode;
    moveLeft: React.ReactNode;
    moveRight: React.ReactNode;
    download: React.ReactNode;
    pagePrev: React.ReactNode;
    pageNext: React.ReactNode;
}

export interface AlbumRefs {
    prevImage: () => any;
    nextImage: () => any;
    goImage: (current: number) => any;
    prevPage: () => any;
    nextPage: () => any;
}

export interface AlbumProps {
    className?: string;
    prefixCls?: string;
    preview?: boolean | Partial<PreviewProps>;
    control?: boolean | Partial<ControlProps>;
    images?: any[] | Partial<ImagesProps>;
    locale?: Partial<LocaleProps>;
    onImageChange?: (image: any) => any;
    onLoad?: () => any;
    onError?: () => any;
    refs?: (album: AlbumRefs | ImageRefs) => any;
}

export interface AlbumState {
    current: number;
    left: number;
    zoom: number;
}

export default class Album extends React.Component<AlbumProps, AlbumState> {
    static defaultProps = {
        prefixCls: 'xrc',
        preview: {
            enable: true,
            width: 600,
            height: 400,
            zoom: true,
            move: true
        },
        control: {
            zoom: true,
            move: true,
            download: true,
            info: true
        },
        images: {
            src: [],
            srcKey: 'src',
            showLength: 5,
            width: 120,
            height: 120,
            interval: 10
        },
        locale: {
            imagePrev: '上一张',
            imageNext: '下一张',
            zoomIn: '放大',
            zoomOut: '缩小',
            zoomSuit: '合适大小',
            zoomDefault: '默认大小',
            moveTop: '上移',
            moveBottom: '下移',
            moveLeft: '左移',
            moveRight: '右移',
            download: '下载图片',
            pagePrev: '上一页',
            pageNext: '下一页'
        }
    }

    static propTypes = {
        className: PropType.string,
        prefixCls: PropType.string,
        preview: PropType.oneOfType([
            PropType.bool,
            PropType.shape({
                enable: PropType.bool,
                width: PropType.number,
                height: PropType.number,
                zoom: PropType.bool,
                move: PropType.bool,
                onZoomChange: PropType.func
            })
        ]),
        control: PropType.oneOfType([
            PropType.bool,
            PropType.shape({
                zoom: PropType.bool,
                move: PropType.bool,
                download: PropType.bool,
                info: PropType.bool,
            })
        ]),
        images: PropType.oneOfType([
            PropType.arrayOf(PropType.any),
            PropType.shape({
                src: PropType.arrayOf(PropType.any),
                srcKey: PropType.string,
                showLength: PropType.number,
                width: PropType.number,
                height: PropType.number,
                interval: PropType.number
            })
        ]),
        locale: PropType.shape({
            imagePrev: PropType.any,
            imageNext: PropType.any,
            zoomIn: PropType.any,
            zoomOut: PropType.any,
            zoomSuit: PropType.any,
            zoomDefault: PropType.any,
            moveTop: PropType.any,
            moveBottom: PropType.any,
            moveLeft: PropType.any,
            moveRight: PropType.any,
            download: PropType.any,
            pagePrev: PropType.any,
            pageNext: PropType.any
        }),
        onImageChange: PropType.func,
        onLoad: PropType.func,
        onError: PropType.func,
        refs: PropType.func
    }

    private minLeft: number = 0;
    private preview: ImageRefs;

    static getImageFromProps(props: AlbumProps): ImagesProps {
        const { images } = props;
        return {
            ...Album.defaultProps.images,
            ...(typeof images !== "undefined" && (Array.isArray(images) ? { src: images } : images))
        }
    }
    static getPreviewFromProps(props: AlbumProps): PreviewProps {
        const { preview } = props;
        return {
            ...Album.defaultProps.preview,
            ...(typeof preview !== "undefined" && (typeof preview === "boolean" ? { enable: preview } : preview))
        }
    }
    static getControlFromProps(props: AlbumProps): ControlProps {
        const { control } = props;
        return {
            ...Album.defaultProps.control,
            ...(typeof control !== "undefined" && (typeof control === "boolean" ? { zoom: control, move: control, download: control, info: control } : control))
        }
    }
    static getLocaleFromProps(props: AlbumProps): LocaleProps {
        const { locale } = props;
        return {
            ...Album.defaultProps.locale,
            ...(typeof locale !== "undefined" && locale)
        }
    }

    constructor(props: AlbumProps) {
        super(props);
        this.state = {
            current: 0,
            left: 0,
            zoom: 0
        }
        const { showLength, width, src, interval } = Album.getImageFromProps(props);
        this.minLeft = showLength > src.length ? 0 : (showLength - src.length) * (width + 2 + interval);
    }
    componentDidMount() {
        const preview = Album.getPreviewFromProps(this.props);
        !preview.enable && this.bindRefs();
    }
    componentWillReceiveProps(nextProps: AlbumProps) {
        const { showLength, width, src, interval } = Album.getImageFromProps(nextProps);
        const _thisImagesProp = Album.getImageFromProps(this.props);
        if (showLength != _thisImagesProp.showLength || width != _thisImagesProp.width || src.length != _thisImagesProp.src.length || interval != _thisImagesProp.interval) {
            this.minLeft = showLength > src.length ? 0 : (showLength - src.length) * (width + 2 + interval);
        }
    }
    prevImage() {
        let { current, left } = this.state;
        const { src, width, interval, showLength } = Album.getImageFromProps(this.props);
        const length = src && src.length || 0;
        current--;
        if (current > length - 1 - showLength / 2) left = this.minLeft;
        else left = left + (width + 2 + interval);
        this.setState({
            current: Math.max(current, 0),
            left: Math.min(0, left)
        });
        this.props.onImageChange && this.props.onImageChange(src && src[current]);
    }
    onPrevImage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.prevImage();
    }
    nextImage() {
        let { current, left } = this.state;
        const { src, width, interval, showLength } = Album.getImageFromProps(this.props);
        const length = src && src.length || 0;
        current++;
        if (current < showLength / 2) left = 0;
        else left = left - (width + 2 + interval);
        this.setState({
            current: Math.min(current, length - 1),
            left: Math.max(this.minLeft, left)
        })
        this.props.onImageChange && this.props.onImageChange(src && src[current]);
    }
    onNextImage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.nextImage();
    }
    goImage(current: number) {
        const { src, width, interval, showLength } = Album.getImageFromProps(this.props);
        const length = src && src.length || 0;
        let left = 0;
        if (current < length / 2) left = 0;
        else if (current > length - 1 - showLength / 2) left = this.minLeft;
        else left = (Math.floor(showLength / 2) - current) * (width + 2 + interval);
        this.setState({
            current,
            left: Math.min(0, Math.max(this.minLeft, left))
        })
        this.props.onImageChange && this.props.onImageChange(src && src[current]);
    }
    onGoImage(current: number, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.goImage(current);
    }
    prevPage() {
        const { left } = this.state;
        const { width, interval, showLength } = Album.getImageFromProps(this.props);
        this.setState({
            left: Math.min(0, left + showLength * (width + 2 + interval))
        })
    }
    onPrevPage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.prevPage();
    }
    nextPage() {
        const { left } = this.state;
        const { width, interval, showLength } = Album.getImageFromProps(this.props);
        this.setState({
            left: Math.max(this.minLeft, left - showLength * (width + 2 + interval))
        })
    }
    onNextPage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        this.nextPage();
    }
    bindRefs(preview?: ImageRefs) {
        this.props.refs && this.props.refs({
            ...preview,
            prevImage: this.prevImage.bind(this),
            nextImage: this.nextImage.bind(this),
            goImage: this.goImage.bind(this),
            prevPage: this.prevPage.bind(this),
            nextPage: this.nextPage.bind(this)
        })
    }

    render() {
        const { current, left, zoom } = this.state;
        const { prefixCls, className } = this.props;
        const images = Album.getImageFromProps(this.props);
        const preview = Album.getPreviewFromProps(this.props);
        const control = Album.getControlFromProps(this.props);
        const locale = Album.getLocaleFromProps(this.props);
        const showImages: string[] = images.src.map((image: any) => typeof image === 'object' ? image[images.srcKey] : image) || [];
        return (
            <div className={classnames(`${prefixCls}-album`, className)}>
                {
                    preview.enable &&
                    <div className={`${prefixCls}-album-preview`} style={{ height: preview.height + 2 }}>
                        <button
                            disabled={current === 0}
                            className={`${prefixCls}-album-button ${prefixCls}-album-button-imageprev`}
                            onClick={this.onPrevImage.bind(this)}>{locale.imagePrev}</button>
                        <Image
                            prefixCls={prefixCls}
                            className={`${prefixCls}-album-image`}
                            src={showImages[current]}

                            zoom={preview.zoom}
                            move={preview.move}
                            height={preview.height}
                            width={preview.width}
                            onZoomChange={(zoom: number) => {
                                this.setState({ zoom });
                                preview.onZoomChange && preview.onZoomChange(zoom)
                            }}
                            refs={this.bindRefs}
                        />
                        <button
                            disabled={current === showImages.length - 1}
                            className={`${prefixCls}-album-button ${prefixCls}-album-button-imagenext`}
                            onClick={this.onNextImage.bind(this)}>{locale.imageNext}</button>
                    </div>
                }
                {
                    ((preview.enable && (control.zoom || control.move)) || control.download || control.info) &&
                    <div className={`${prefixCls}-album-control`}>
                        {
                            control.zoom &&
                            <div className={`${prefixCls}-album-control-zoom`}>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-zoomin`} onClick={e => { e.preventDefault(); this.preview && this.preview.zoomIn(); }}>{locale.zoomIn}</button>
                                <span className={`${prefixCls}-album-zoompercent`}>{Math.round(zoom * 100)}%</span>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-zoomout`} onClick={e => { e.preventDefault(); this.preview && this.preview.zoomOut(); }}>{locale.zoomOut}</button>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-zoomsuit`} onClick={e => { e.preventDefault(); this.preview && this.preview.zoomSuit(); }}>{locale.zoomSuit}</button>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-zoomdefault`} onClick={e => { e.preventDefault(); this.preview && this.preview.zoomDefault(); }}>{locale.zoomDefault}</button>
                            </div>
                        }
                        {
                            control.move &&
                            <div className={`${prefixCls}-album-control-move`}>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-moveleft`} onClick={e => { e.preventDefault(); this.preview && this.preview.moveLeft(); }}>{locale.moveLeft}</button>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-moveright`} onClick={e => { e.preventDefault(); this.preview && this.preview.moveRight(); }}>{locale.moveRight}</button>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-movetop`} onClick={e => { e.preventDefault(); this.preview && this.preview.moveTop(); }}>{locale.moveTop}</button>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-movebottom`} onClick={e => { e.preventDefault(); this.preview && this.preview.moveBottom(); }}>{locale.moveBottom}</button>
                            </div>
                        }
                        {
                            control.download &&
                            <div className={`${prefixCls}-album-control-download`}>
                                <button className={`${prefixCls}-album-button ${prefixCls}-album-button-download"`} onClick={e => { e.preventDefault(); this.preview && this.preview.download(); }}>{locale.download}</button>
                            </div>
                        }
                        {
                            control.info &&
                            <div className={`${prefixCls}-album-control-info`}>
                                当前第 <span className={`${prefixCls}-album-current`}>{current + 1}</span> 张 / 共 <span className={`${prefixCls}-album-total`}>{showImages.length}</span> 张
                            </div>
                        }
                    </div>
                }
                <div className={`${prefixCls}-album-imagelist`} style={{ height: images.height + 2 }}>
                    <button
                        disabled={left === 0}
                        className={`${prefixCls}-album-button ${prefixCls}-album-button-pageprev`}
                        onClick={this.onPrevPage.bind(this)}>{locale.pagePrev}</button>
                    {
                        images &&
                        <div
                            className={`${prefixCls}-album-imagelist-overflow`}
                            style={{ width: images.showLength * (images.width + 2 + images.interval) - images.interval }}>
                            <ul style={{
                                width: (images.width + 2 + images.interval) * showImages.length - images.interval,
                                left
                            }}>
                                {
                                    showImages.map((image, index) =>
                                        <li key={index}
                                            onClick={this.onGoImage.bind(this, index)}
                                            style={{
                                                marginLeft: index === 0 ? 0 : images.interval
                                            }}
                                            className={classnames({
                                                'current': current === index
                                            })}>
                                            <Image
                                                prefixCls={prefixCls}
                                                className={`${prefixCls}-album-image`}
                                                src={image}
                                                width={images.width}
                                                height={images.height}
                                                onLoad={() => current === index && this.props.onLoad && this.props.onLoad()}
                                                onError={() => current === index && this.props.onError && this.props.onError()}
                                            />
                                        </li>)
                                }
                            </ul>
                        </div>
                    }
                    <button
                        disabled={left === this.minLeft}
                        className={`${prefixCls}-album-button ${prefixCls}-album-button-pagenext`}
                        onClick={this.onNextPage.bind(this)}>{locale.pageNext}</button>
                </div>
            </div>
        )
    }
}