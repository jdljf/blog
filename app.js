const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const router = require('./router')

const app = express()

app.engine('html', require('express-art-template'))
// app.set('view options', {
//     debug: process.env.NODE_ENV !== 'production'
// })
app.set('views', path.join(__dirname, './views/'))  // 默认就是views目录，方便改

// 把相对路径改成绝对路径
// __dirname就是当前文件的绝对路径
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 当把 express-session 配置好后，我们可以通过 req.session 来访问和设置 Session 成员
//      添加 Session 数据： req.session.foo = 'bar'
//      访问 Session 数据： req.session.foo
app.use(session({
    secret: 'itcast', // 加密字符串，相当于在原有加密基础之上和这个字符串拼接
    resave: false,
    saveUninitialized: true // 无论你是否使用 session ，我都默认给你分配一个电子柜的钥匙
}))

app.use(router)

// 配置一个404中间件
app.use(function (req, res) {
    res.render('404.html')
})

// 配置一个全局错误处理中间件
app.use(function (err, req, res, next) {
    res.status(500).json({
        err_code: 500,
        message: err.message
    })
})

app.listen(3000, () => {
    console.log('服务启动成功，请用浏览器打开http://127.0.0.1:3000')
})