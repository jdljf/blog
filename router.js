const express = require('express')
const User = require('./models/user')
const md5 = require('blueimp-md5')

var router = express.Router()

router.get('/', function (req, res) {
    res.render('index.html', {
        user: req.session.user
    })
})

router.get('/login', function (req, res) {
    res.render('login.html')
})

router.post('/login', function (req, res, next) {
    var body = req.body
    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function (err, user) {
        if (err) {
            // return res.status(500).json({
            //     err_code: 500,
            //     message: err.message
            // })
            return next(err)
        }

        if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'email or password is invalid'
            })
        }

        // 判断用户存在，登录成功，通过 session 记录登录状态
        req.session.user = user

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

router.get('/register', function (req, res) {
    res.render('register.html')
})

router.post('/register', function (req, res, next) {
    console.log(req.body)
    // 2. 操作数据库
    //      判断该用户是否存在
    //      如果存在，不允许注册
    //      如果不存在，注册新建用户
    // 3. 发送响应
    var body = req.body
    User.findOne({
        $or: [
            {
                email: body.email
            },
            {
                nickname: body.nickname
            }
        ]
    }, function (err, data) {
        if (err) {
            // return res.status(500).json({
            //     err_code: 500,
            //     message: '服务端出错啦'
            // })
            return next(err)
        }
        if (data) {
            return res.status(200).json({
                err_code: 1,
                message: '昵称或邮箱已存在'
            })
        }

        // 对密码进行 md5 重复加密
        // 加密两次防止密码过于简单
        body.password = md5(md5(body.password))
        new User(body).save(function (err, user, next) {
            if (err) {
                // return res.status(500).json({
                //     err_code: 500,
                //     message: '服务端出错啦'
                // })
                return next(err)
            }

            // 注册成功，使用session记录用户的登录状态
            req.session.user = user
            // express 提供一个方法作为一个参数，自动把对象转换成字符串
            res.status(200).json({
                err_code: 0,
                message: 'ok'
            })
        })
    })
})

router.get('/logout', function (req, res) {
    // 清除登录状态
    // 重定向登录页
    req.session.user = null
    res.redirect('/login')
})

module.exports = router