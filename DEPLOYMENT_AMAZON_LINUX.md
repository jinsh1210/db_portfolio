# AWS EC2 배포 가이드 (Amazon Linux 2023)

## 1. EC2 접속 확인
```bash
ssh -i ~/dbportfolio.pem ec2-user@ec2-13-211-240-172.ap-southeast-2.compute.amazonaws.com
```

## 2. 서버 환경 설정

### Node.js 설치 (Amazon Linux용)
```bash
# Node.js 20.x 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# NVM으로 Node.js 설치
nvm install 20
nvm use 20
nvm alias default 20

# 버전 확인
node -v
npm -v
```

### MySQL 설치 및 설정
```bash
# MariaDB 설치 (Amazon Linux에서 권장)
sudo yum update -y
sudo yum install mariadb105-server -y

# MariaDB 시작
sudo systemctl start mariadb
sudo systemctl enable mariadb

# 보안 설정
sudo mysql_secure_installation
# Enter (현재 비밀번호 없음)
# Y (root 비밀번호 설정)
# 새 비밀번호 입력
# Y (익명 사용자 제거)
# Y (원격 root 로그인 비활성화)
# Y (test 데이터베이스 제거)
# Y (권한 테이블 다시 로드)

# MySQL/MariaDB 접속
sudo mysql -u root -p

# 데이터베이스 및 사용자 생성
CREATE DATABASE portfolio_db;
CREATE USER 'db202245066'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'db202245066'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### PM2 설치
```bash
npm install -g pm2
```

### Git 설치
```bash
sudo yum install git -y
```

## 3. 프로젝트 배포

### 코드 가져오기
```bash
cd ~
git clone https://github.com/jinsh1210/db_portfolio.git
cd db_portfolio
```

### 의존성 설치
```bash
npm install --production
```

### 환경 변수 설정
```bash
nano .env
```

**.env 파일 내용:**
```
DB_HOST=localhost
DB_USER=db202245066
DB_PASSWORD=your_secure_password
DB_NAME=portfolio_db
PORT=3000
```

저장: `Ctrl + X`, `Y`, `Enter`

### 데이터베이스 스키마 생성
```bash
mysql -u db202245066 -p portfolio_db < schema.sql
```

### 필수 디렉토리 생성
```bash
mkdir -p logs
mkdir -p src/public/uploads
chmod 755 src/public/uploads
```

## 4. 애플리케이션 실행

### PM2로 실행
```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs portfolio

# 부팅 시 자동 시작
pm2 startup
# 출력된 명령어 복사해서 실행
pm2 save
```

## 5. 방화벽 설정

### EC2 보안 그룹에서 포트 열기
AWS 콘솔 > EC2 > 보안 그룹에서:
- 인바운드 규칙 추가
- 포트 3000, TCP, 소스: 0.0.0.0/0 (또는 내 IP)

## 6. 접속 테스트

브라우저에서:
```
http://13.211.240.172:3000
```

## 7. Nginx 설정 (선택사항 - 80번 포트 사용)

### Nginx 설치
```bash
sudo yum install nginx -y
```

### Nginx 설정
```bash
sudo nano /etc/nginx/nginx.conf
```

`server` 블록 내용을 다음으로 교체:
```nginx
server {
    listen 80;
    server_name 13.211.240.172;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Nginx 시작
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

이제 http://13.211.240.172 로 접속 가능합니다 (포트 번호 없이).

## 8. 유용한 명령어

### PM2
```bash
pm2 list                  # 앱 목록
pm2 restart portfolio     # 재시작
pm2 stop portfolio        # 중지
pm2 logs portfolio        # 로그 보기
pm2 monit                 # 모니터링
```

### MariaDB/MySQL
```bash
sudo systemctl status mariadb    # 상태 확인
sudo systemctl restart mariadb   # 재시작
mysql -u db202245066 -p          # 접속
```

### 시스템
```bash
df -h              # 디스크 사용량
free -h            # 메모리 사용량
top                # 프로세스 모니터링
```

## 9. 업데이트 배포

```bash
cd ~/db_portfolio
git pull origin main
npm install --production
pm2 restart portfolio
```

## 10. 문제 해결

### 포트 사용 중
```bash
sudo lsof -i :3000
sudo kill -9 [PID]
```

### 데이터베이스 연결 오류
```bash
sudo systemctl status mariadb
sudo systemctl restart mariadb
```

### 로그 확인
```bash
pm2 logs portfolio --lines 100
tail -f ~/db_portfolio/logs/err.log
```

## 접속 정보

- **웹사이트**: http://13.211.240.172:3000
- **관리자**: http://13.211.240.172:3000/admin
