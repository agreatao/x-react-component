图片组件（Image Component）

```jsx
import { Image } from 'x-react-component';
<Image
    radio={1.452}
    src=""
    className=""
    style={{}}
    width={100}
    height={100}
    zoomable={true}
    dragable={true}
    onLoad={() => {}}
    onError={() => {}}
    onMouseDown={() => {}}
    onMouseMove={() => {}}
    onMouseUp={() => {}}
    onMouseEnter={() => {}}
    onMouseLeave={() => {}}
    onZoomChange={() => {}}
    refs={image => this.image = image}
/>

```

# API 

图片组件属性如下：

| 属性         |           说明           |                      类型 | 默认值 |
| ------------ | :----------------------: | ------------------------: | -----: |
| radio        |   宽高比（宽度/高度）    |              ```number``` |        |
| src          |         图片文件         |              ```string``` |        |
| className    |           类名           |              ```string``` |        |
| style        |     样式（css样式）      |              ```object``` |        |
| width        |         容器宽度         |              ```number``` |        |
| height       |         容器高度         |              ```number``` |        |
| zoomable     |        是否可缩放        |             ```boolean``` |  false |
| dragable     |      是否可拖拽移动      |             ```boolean``` |  false |
| onLoad       |  图片加载完成时回调事件  |         ```function(e)``` |        |
| onError      |  图片加载失败时回调事件  |         ```function(e)``` |        |
| onMouseDown  |  图片鼠标按下时回调事件  | ```function(target, e)``` |        |
| onMouseMove  |  图片鼠标移动时回调事件  | ```function(target, e)``` |        |
| onMouseUp    |  图片鼠标松开时回调事件  | ```function(target, e)``` |        |
| onMouseEnter | 鼠标移进图片区域回调事件 | ```function(target, e)``` |        |
| onMouseLeave | 鼠标移出图片区域回调事件 | ```function(target, e)``` |        |
| onZoomChange | 鼠标缩放时触发的回调时间 | ```function(target, e)``` |        |
| refs         |       图片容器实例       |     ```function(image)``` |        |

回调事件中的```target```属性包含以下属性：

| 属性   |            说明            |              类型 |
| ------ | :------------------------: | ----------------: |
| x      | 鼠标距离图片左边界的百分比 | ```number(0~1)``` |
| y      | 鼠标距离图片上边界的百分比 | ```number(0~1)``` |
| width  |      图片当前实际宽度      |      ```number``` |
| height |      图片当前实际高度      |      ```number``` |

```refs```提供可以操作图片缩放控制的实例，当设置```zoomable = true```时有效

```jsx
<Image
    src={...}
    zoomable={true}
    // ...
    refs={image => this.image = image}
/>

<a onClick={() => this.image && this.image.zoomIn()}>放大</a>

```
```refs```回调参数```image```提供的方法包括：

| 属性        |                                说明                                 |                  类型 |
| ----------- | :-----------------------------------------------------------------: | --------------------: |
| zoomIn      |                                放大                                 | ```function(step?)``` |
| zoomOut     |                                缩小                                 | ```function(step?)``` |
| zoomSuit    | 设定组件的```width```和```height```时，可以使图片放大缩小到容器大小 |      ```function()``` |
| zoomDefault |                     图片不缩放，以实际大小显示                      |      ```function()``` |
| moveTop     |                                上移                                 | ```function(step?)``` |
| moveBottom  |                                下移                                 | ```function(step?)``` |
| moveLeft    |                                左移                                 | ```function(step?)``` |
| moveRight   |                                右移                                 | ```function(step?)``` |

```step``` 为放大倍数，默认```0.1```