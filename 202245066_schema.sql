-- 포트폴리오 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technology VARCHAR(255),
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 연락처 메시지 테이블
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기술 스택 테이블
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About 정보 테이블
CREATE TABLE IF NOT EXISTS about_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_dynamic BOOLEAN DEFAULT FALSE COMMENT '동적 값 여부 (TRUE: DB에서 계산, FALSE: 사용자 입력)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 샘플 데이터 삽입
INSERT INTO projects (title, description, technology, github_url, image_url) VALUES
('포트폴리오 웹사이트', 'Node.js와 MySQL을 활용한 개인 포트폴리오 웹사이트', 'Node.js, Express, MySQL', 'https://github.com/jinsh1210/db_portfolio.git', '/uploads/placeholder.jpg'),
('프로젝트 2', '두 번째 프로젝트 설명', 'React, Node.js', 'https://github.com', '/uploads/placeholder.jpg');

INSERT INTO skills (category, name, level) VALUES
('Frontend', 'HTML/CSS', 90),
('Frontend', 'JavaScript', 85),
('Frontend', 'React', 80),
('Backend', 'Node.js', 85),
('Backend', 'Express', 80),
('Database', 'MySQL', 75),
('Database', 'MongoDB', 70);

-- About 정보 샘플 데이터
INSERT INTO about_info (section_key, title, value, display_order, is_dynamic) VALUES
('completed_projects', '완료 프로젝트', '0', 1, TRUE),
('years_experience', '개발 경력', '2022', 2, TRUE),
('tech_stack', '기술 스택', '0', 3, TRUE);
