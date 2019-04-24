import * as React from 'react';
import PropType from 'prop-types';
import classnames from 'classnames';
import Image, { ImageRefs } from './image';

export interface PreviewProps {
    enable: boolean;
    width: number;
    height: number;
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
}

export interface DefaultAlbumProps {
    prefixCls: string;
    preview: PreviewProps;
    control: ControlProps;
    images: ImagesProps;
    locale: LocaleProps;
}

export interface AlbumState {
    current: number;
    left: number;
    zoom: number;
}

export default class Album extends React.Component<AlbumProps, AlbumState> {
    static defaultProps: DefaultAlbumProps = {
        prefixCls: 'xrc',
        preview: {
            enable: true,
            width: 600,
            height: 400,
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
                height: PropType.number
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
        onImageChange: PropType.func
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
    componentWillReceiveProps(nextProps: AlbumProps) {
        const { showLength, width, src, interval } = Album.getImageFromProps(nextProps);
        const _thisImagesProp = Album.getImageFromProps(this.props);
        if (showLength != _thisImagesProp.showLength || width != _thisImagesProp.width || src.length != _thisImagesProp.src.length || interval != _thisImagesProp.interval) {
            this.minLeft = showLength > src.length ? 0 : (showLength - src.length) * (width + 2 + interval);
        }
    }
    onPrevImage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
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
    onNextImage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
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
    onGoImage(current: number, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
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
    onPrevPage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const { left } = this.state;
        const { width, interval, showLength } = Album.getImageFromProps(this.props);
        this.setState({
            left: Math.min(0, left + showLength * (width + 2 + interval))
        })
    }
    onNextPage(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const { left } = this.state;
        const { width, interval, showLength } = Album.getImageFromProps(this.props);
        this.setState({
            left: Math.max(this.minLeft, left - showLength * (width + 2 + interval))
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
                            className="image-prev"
                            onClick={this.onPrevImage.bind(this)}>{locale.imagePrev}</button>
                        <Image
                            prefixCls={prefixCls}
                            className="preview-image"
                            zoom={true}
                            move={true}
                            src={showImages[current]}
                            height={preview.height}
                            width={preview.width}
                            onZoomChange={(zoom: number) => this.setState({ zoom })}
                            refs={(preview: ImageRefs) => this.preview = preview}
                            onError={this.props.onError}
                            onLoad={this.props.onLoad}
                        />
                        <button
                            disabled={current === showImages.length}
                            className="image-next"
                            onClick={this.onNextImage.bind(this)}>{locale.imageNext}</button>
                    </div>
                }
                {
                    ((preview.enable && (control.zoom || control.move)) || control.download || control.info) &&
                    <div className={`${prefixCls}-album-control`}>
                        {
                            control.zoom &&
                            <div className={`${prefixCls}-control-zoom`}>
                                <button className="control-zoomin" onClick={e => { e.preventDefault(); this.preview && this.preview.zoomIn(); }}>{locale.zoomIn}</button>
                                <span>{Math.round(zoom * 100)}%</span>
                                <button className="control-zoomout" onClick={e => { e.preventDefault(); this.preview && this.preview.zoomOut(); }}>{locale.zoomOut}</button>
                                <button className="control-zoomsuit" onClick={e => { e.preventDefault(); this.preview && this.preview.zoomSuit(); }}>{locale.zoomSuit}</button>
                                <button className="control-zoomdefault" onClick={e => { e.preventDefault(); this.preview && this.preview.zoomDefault(); }}>{locale.zoomDefault}</button>
                            </div>
                        }
                        {
                            control.move &&
                            <div className={`${prefixCls}-control-move`}>
                                <button className="control-moveleft" onClick={e => { e.preventDefault(); this.preview && this.preview.moveLeft(); }}>{locale.moveLeft}</button>
                                <button className="control-moveright" onClick={e => { e.preventDefault(); this.preview && this.preview.moveRight(); }}>{locale.moveRight}</button>
                                <button className="control-movetop" onClick={e => { e.preventDefault(); this.preview && this.preview.moveTop(); }}>{locale.moveTop}</button>
                                <button className="control-movebottom" onClick={e => { e.preventDefault(); this.preview && this.preview.moveBottom(); }}>{locale.moveBottom}</button>
                            </div>
                        }
                        {
                            control.download &&
                            <div className={`${prefixCls}-control-download`}>
                                <button className="control-download" onClick={e => { e.preventDefault(); this.preview && this.preview.download(); }}>{locale.download}</button>
                            </div>
                        }
                        {
                            control.info &&
                            <div className={`${prefixCls}-control-info`}>
                                当前第 {current + 1} 张 / 共 {showImages.length} 张
                            </div>
                        }
                    </div>
                }
                <div className={`${prefixCls}-album-imagelist`} style={{ height: images.height + 2 }}>
                    <button
                        className="page-prev"
                        onClick={this.onPrevPage.bind(this)}>{locale.pagePrev}</button>
                    {
                        images &&
                        <div
                            className="imagelist-overflow"
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
                                                className="imagelist-image"
                                                src={image}
                                                width={images.width}
                                                height={images.height}
                                            />
                                        </li>)
                                }
                            </ul>
                        </div>
                    }
                    <button
                        className="page-next"
                        onClick={this.onNextPage.bind(this)}>{locale.pageNext}</button>
                </div>
            </div>
        )
    }
}