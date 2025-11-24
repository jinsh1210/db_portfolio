# 개인 포트폴리오 웹사이트

Node.js, Express, MySQL을 사용한 개인 포트폴리오 웹사이트입니다.

## 프로젝트 구조

```
portfolio/
├── app.js              # 메인 애플리케이션 파일
├── package.json        # 프로젝트 의존성
├── .env                # 환경 변수
├── schema.sql          # 데이터베이스 스키마
└── src/
    ├── config/         # 설정 파일
    │   └── database.js
    ├── routes/         # 라우트 파일
    │   └── index.js
    ├── views/          # EJS 템플릿
    │   ├── index.ejs
    │   ├── project.ejs
    │   └── 404.ejs
    └── public/         # 정적 파일
        └── style.css
```

## 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/jinsh1210/db_portfolio.git
cd portfolio
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 수정하여 MySQL 연결 정보를 설정합니다:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
PORT=3000
```

4. 데이터베이스 설정
MySQL에 접속하여 schema.sql 파일을 실행합니다:
```bash
mysql -u root -p < schema.sql
```

5. 서버 실행
```bash
npm start
```

개발 모드로 실행 (nodemon 필요):
```bash
npm install -g nodemon
npm run dev
```

6. 브라우저에서 접속
```
http://localhost:3000
```

## 주요 기능

- 프로젝트 포트폴리오 관리
- 기술 스택 표시
- 연락처 폼
- 반응형 디자인

## 기술 스택

- **Backend**: Node.js, Express
- **Database**: MySQL
- **Template Engine**: EJS
- **CSS**: Vanilla CSS

## 라이선스

ISC
