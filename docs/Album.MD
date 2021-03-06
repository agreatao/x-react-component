图片组件（Image Component）

```jsx
import { Image } from "x-react-component";

<Album
    images={["images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg"]}
/>;
```

# API

相册组件属性如下：

| 属性          |           说明           |                     类型 | 默认值 |
| ------------- | :----------------------: | -----------------------: | -----: |
| prefixCls     |       默认类名前缀       |                 `string` |  `xrc` |
| className     |           类名           |                 `string` |        |
| preview       |     样式（css 样式）     | `boolean / PreviewProps` |        |
| control       |        是否可缩放        | `boolean / ControlProps` |  false |
| images        |      是否可拖拽移动      |     `any[] / ImageProps` |        |
| locale        |       图片容器实例       |            `LocaleProps` |        |
| onImageChange | 鼠标缩放时触发的回调时间 |        `function(image)` |        |
| onLoad        |  图片鼠标按下时回调事件  |             `function()` |        |
| onError       |  图片鼠标移动时回调事件  |             `function()` |        |
| refs          |  图片鼠标松开时回调事件  |        `function(album)` |        |

`zoom` 的 `object` 属性如下：

| 属性      |     说明     |      类型 | 默认值 |
| --------- | :----------: | --------: | -----: |
| enable    | 是否可以缩放 | `boolean` |        |
| minWidth  | 缩放最小宽度 |  `number` |        |
| minHeight | 缩放最小高度 |  `number` |        |
| maxWidth  | 缩放最大宽度 |  `number` |        |
| minHeight | 缩放最大高度 |  `number` |        |

如果`zoom`为`boolean`值，或者没有设置最小，最大宽度高度等信息时，默认最小/最大缩放比例时 5 倍

`move` 的 `object` 属性如下：

| 属性   |     说明     |      类型 | 默认值 |
| ------ | :----------: | --------: | -----: |
| enable | 是否可以移动 | `boolean` |        |

回调事件中的`eventTarget`属性包含以下属性：

| 属性    |            说明            |          类型 |
| ------- | :------------------------: | ------------: |
| x       | 鼠标距离图片左边界的百分比 | `number(0~1)` |
| y       | 鼠标距离图片上边界的百分比 | `number(0~1)` |
| width   |      图片当前实际宽度      |      `number` |
| height  |      图片当前实际高度      |      `number` |
| offsetX |  鼠标当前距图片左边距距离  |      `number` |
| offsetY |  鼠标当前距图片上边距距离  |      `number` |
| zoom    |       图片当前缩放比       |      `number` |

对于`refs`的使用方法如下：

```jsx
<Album
    images={...}
    preview={}
    // ...
    refs={image => this.image = image}
/>

<a onClick={() => this.image && this.image.zoomIn()}>放大</a>

```

`refs`回调参数`image`提供的方法包括：

| 属性        |                            说明                             |              类型 |
| ----------- | :---------------------------------------------------------: | ----------------: |
| zoomIn      |                            放大                             | `function(step?)` |
| zoomOut     |                            缩小                             | `function(step?)` |
| zoomSuit    | 设定组件的`width`和`height`时，可以使图片放大缩小到容器大小 |      `function()` |
| zoomDefault |                 图片不缩放，以实际大小显示                  |      `function()` |
| moveTop     |                            上移                             | `function(step?)` |
| moveBottom  |                            下移                             | `function(step?)` |
| moveLeft    |                            左移                             | `function(step?)` |
| moveRight   |                            右移                             | `function(step?)` |
| download    |                          下载图片                           |      `function()` |

`step` 为放大倍数，默认`0.1`
