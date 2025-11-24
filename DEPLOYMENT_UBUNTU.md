# AWS EC2 배포 가이드

## 1. EC2 인스턴스 준비

### EC2 인스턴스 생성

1. AWS 콘솔에서 EC2 서비스 접속
2. **Launch Instance** 클릭
3. 설정:
   - **AMI**: Ubuntu Server 22.04 LTS (또는 Amazon Linux 2023)
   - **Instance Type**: t2.micro (프리티어) 또는 t2.small
   - **Security Group**: 다음 포트 열기
     - SSH (22)
     - HTTP (80)
     - HTTPS (443)
     - Custom TCP (3000) - Node.js 앱용
   - **Storage**: 8GB 이상

### 키 페어 다운로드

- `.pem` 파일을 안전한 곳에 저장
- 권한 설정: `chmod 400 your-key.pem`

## 2. EC2 접속

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## 3. 서버 환경 설정

### Node.js 설치

```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node -v
npm -v
```

### MySQL 설치 및 설정

```bash
# MySQL 설치
sudo apt update
sudo apt install mysql-server -y

# MySQL 보안 설정
sudo mysql_secure_installation

# MySQL 접속
sudo mysql

# MySQL에서 실행
CREATE DATABASE portfolio_db;
CREATE USER 'db202245066'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'db202245066'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### PM2 설치 (프로세스 관리)

```bash
sudo npm install -g pm2
```

### Git 설치

```bash
sudo apt install git -y
```

## 4. 프로젝트 배포

### 코드 가져오기

```bash
# 홈 디렉토리로 이동
cd ~

# Git clone (GitHub 저장소가 있는 경우)
git clone https://github.com/your-username/portfolio.git

# 또는 파일 직접 업로드 (로컬에서 실행)
# scp -i your-key.pem -r ./portfolio ubuntu@your-ec2-public-ip:~/
```

### 프로젝트 설정

```bash
cd portfolio

# 의존성 설치
npm install --production

# 환경 변수 설정
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

### 데이터베이스 스키마 생성

```bash
# MySQL에 스키마 파일 import
mysql -u db202245066 -p portfolio_db < schema.sql

# 초기 데이터 있는 경우
mysql -u db202245066 -p portfolio_db < seed.sql
```

### 필수 디렉토리 생성

```bash
mkdir -p logs
mkdir -p src/public/uploads
chmod 755 src/public/uploads
```

## 5. PM2로 애플리케이션 실행

```bash
# PM2로 앱 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs portfolio

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

## 6. Nginx 설정 (선택사항 - 80번 포트 사용)

### Nginx 설치

```bash
sudo apt install nginx -y
```

### Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/portfolio
```

**설정 내용:**

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 또는 EC2 퍼블릭 IP

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

### Nginx 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# 기본 사이트 비활성화
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 7. 방화벽 설정 (UFW)

```bash
# UFW 활성화
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

## 8. SSL 인증서 설정 (선택사항 - HTTPS)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

## 9. 유용한 명령어

### PM2 관리

```bash
pm2 list                  # 실행 중인 앱 목록
pm2 restart portfolio     # 앱 재시작
pm2 stop portfolio        # 앱 중지
pm2 delete portfolio      # 앱 삭제
pm2 logs portfolio        # 로그 보기
pm2 monit                 # 모니터링
```

### MySQL 관리

```bash
# MySQL 접속
mysql -u db202245066 -p

# 데이터베이스 백업
mysqldump -u db202245066 -p portfolio_db > backup.sql

# 데이터베이스 복원
mysql -u db202245066 -p portfolio_db < backup.sql
```

### 서버 관리

```bash
# 디스크 사용량 확인
df -h

# 메모리 사용량 확인
free -h

# 시스템 리소스 모니터링
htop
```

## 10. 업데이트 배포

```bash
# 코드 업데이트
cd ~/portfolio
git pull origin main

# 의존성 업데이트 (필요시)
npm install --production

# PM2로 재시작
pm2 restart portfolio
```

## 11. 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 포트 사용 프로세스 확인
sudo lsof -i :3000

# 프로세스 종료
sudo kill -9 [PID]
```

### 데이터베이스 연결 오류

```bash
# MySQL 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql
```

### 파일 권한 오류

```bash
# 프로젝트 디렉토리 권한 설정
chmod -R 755 ~/portfolio
chmod -R 777 ~/portfolio/src/public/uploads
chmod -R 777 ~/portfolio/logs
```

## 12. 보안 권장사항

1. **환경 변수 보호**: .env 파일 권한을 600으로 설정

   ```bash
   chmod 600 .env
   ```

2. **MySQL 비밀번호**: 강력한 비밀번호 사용

3. **SSH 키**: 비밀번호 로그인 비활성화

4. **정기 업데이트**: 시스템 패키지 정기적으로 업데이트

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **백업**: 정기적으로 데이터베이스 백업

## 접속 정보

- **웹사이트**: http://your-ec2-public-ip:3000 (또는 http://your-domain.com)
- **관리자 페이지**: http://your-ec2-public-ip:3000/admin

## 도움말

문제가 발생하면:

1. PM2 로그 확인: `pm2 logs portfolio`
2. Nginx 로그 확인: `sudo tail -f /var/log/nginx/error.log`
3. MySQL 로그 확인: `sudo tail -f /var/log/mysql/error.log`
