const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// 미들웨어 설정
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 라우트 설정
const indexRouter = require('./src/routes/index');
const adminRouter = require('./src/routes/admin');

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// 404 에러 핸들링
app.use((req, res) => {
    res.status(404).render('404');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
