const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 添加以下配置来支持 Electron
  pluginOptions: {
    electronBuilder: {
      // 指定主进程文件的路径
      mainProcessFile: '../main.js',
      // 如果你有预加载脚本，可以指定预加载脚本的路径
      preload: '../preload.js',
      // 在打包时使用的配置
      builderOptions: {
        appId: 'com.example.myapp',
        productName: 'seroto', // 项目名称
        directories: {
          output: '../dist_electron', // 输出路径
        },
        // 可以在这里添加更多的打包配置
        win: {
          target: 'nsis', // Windows 打包目标类型
          icon: 'public/favicon.ico' // 应用图标
        },
      }
    }
  },
  // 可选配置：如果你需要配置开发服务器或其他 Webpack 配置
  devServer: {
    port: 3300, // 更改开发服务器端口号
    open: false  // 自动打开浏览器
  }
})
