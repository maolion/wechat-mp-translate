# 基于微信小程序开发框架的 Google Translate(IOS) 山寨版

## 使用

```
git clone https://github.com/maolion/wechat-mp-translate.git

cd wechat-mp-translate

npm install

cp src/config.js.sample src/config.js
# 如果需要 可以修改 src/config.js 的配置

npm run start
```

然后在 微信web开发者工具里添加该项目, 项目目录是 ```path/to/wechat-mp-translate/dist```


## 源码调试

- 推介使用 EgretWing 编辑器
- 在项目根目录 创建 ```.wing/settings.json``` 文件, 并加入下面的配置

  ```
  {
    "files.associations": {
      "*.wxss": "less"
    }
  }
  ```

  或 如果使用 visual studio code 请在项目目录 创建 ```.vscode/settings.json``` 文件，
  并加入下面的配置

  ```
  {
    "files.associations": {
      "*.wxss": "less",
      "*.wxml": "html"
    }
  }
  ```
