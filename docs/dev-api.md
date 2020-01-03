# API


# Firefox


## Publish 

https://addons.mozilla.org/zh-CN/firefox/

> Extensions 

https://addons.mozilla.org/zh-CN/developers/addons

## Development API 

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

server {
  listen  80;
  server_name dl.ppn.one;

#  return 301 https://$server_name$request_uri;

  # http2 need recomments
  root    /data/www/bas.ppn.one;

  location /  {
    index index.html;
  }

  access_log /var/log/nginx/bas_log.log;
}