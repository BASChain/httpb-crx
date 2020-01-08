# Distribution ISSUE



## reject distribution
> 

``` textarea
由于存在以下问题，您的扩展程序可能必须接受深入审核：
- 宽泛的主机权限
除了请求宽泛的主机权限或 content script 网站匹配项之外，您也可考虑指定您的扩展程序需要访问的网站，或者使用 activeTab 权限。相较于针对数量不定的网站授予完整访问权限，这两种方法不仅更安全，还可能有助于最大限度地缩减审核用时。

activeTab 权限允许访问相应标签页以响应明确的用户手势。

{
...
"permissions": ["activeTab"]
}
如果您的扩展程序只是需要在某些网站上运行，请直接在扩展程序清单中指定这些网站：
{
...
"permissions": ["https://example.com/*"]
}
```