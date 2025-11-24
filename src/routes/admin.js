const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer 설정 - 파일 업로드
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다 (jpeg, jpg, png, gif, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB 제한
});

// 카테고리 목록
const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Design'];

// 관리자 메인 페이지
router.get('/', async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
        const [skills] = await db.query('SELECT * FROM skills ORDER BY category, name');
        const [aboutInfo] = await db.query('SELECT * FROM about_info ORDER BY display_order');

        res.render('admin/index', { projects, skills, aboutInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 프로젝트 추가 페이지
router.get('/projects/new', (req, res) => {
    res.render('admin/project-form', { project: null });
});

// 프로젝트 추가 처리
router.post('/projects', upload.single('image'), async (req, res) => {
    try {
        const { title, description, technology, github_url, demo_url } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.jpg';

        await db.query(
            'INSERT INTO projects (title, description, technology, github_url, demo_url, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, technology, github_url || null, demo_url || null, image_url]
        );

        res.redirect('/admin?success=project_created');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다: ' + error.message);
    }
});

// 프로젝트 수정 페이지
router.get('/projects/:id/edit', async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

        if (projects.length === 0) {
            return res.status(404).send('프로젝트를 찾을 수 없습니다.');
        }

        res.render('admin/project-form', { project: projects[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 프로젝트 수정 처리
router.post('/projects/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, technology, github_url, demo_url } = req.body;

        // 기존 프로젝트 정보 가져오기
        const [existingProjects] = await db.query('SELECT image_url FROM projects WHERE id = ?', [req.params.id]);

        let image_url;
        if (req.file) {
            // 새 이미지가 업로드된 경우
            image_url = `/uploads/${req.file.filename}`;

            // 기존 이미지 삭제 (placeholder가 아닌 경우)
            if (existingProjects[0] && existingProjects[0].image_url && !existingProjects[0].image_url.includes('placeholder')) {
                const oldImagePath = path.join(__dirname, '../public', existingProjects[0].image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        } else {
            // 기존 이미지 유지
            image_url = existingProjects[0].image_url;
        }

        await db.query(
            'UPDATE projects SET title = ?, description = ?, technology = ?, github_url = ?, demo_url = ?, image_url = ? WHERE id = ?',
            [title, description, technology, github_url || null, demo_url || null, image_url, req.params.id]
        );

        res.redirect('/admin?success=project_updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다: ' + error.message);
    }
});

// 프로젝트 삭제
router.post('/projects/:id/delete', async (req, res) => {
    try {
        // 이미지 파일도 삭제
        const [projects] = await db.query('SELECT image_url FROM projects WHERE id = ?', [req.params.id]);
        if (projects[0] && projects[0].image_url && !projects[0].image_url.includes('placeholder')) {
            const imagePath = path.join(__dirname, '../public', projects[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.redirect('/admin?success=project_deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 스킬 추가 페이지
router.get('/skills/new', (req, res) => {
    res.render('admin/skill-form', { skill: null, categories: SKILL_CATEGORIES });
});

// 스킬 추가 처리
router.post('/skills', async (req, res) => {
    try {
        const { category, name, level } = req.body;

        await db.query(
            'INSERT INTO skills (category, name, level) VALUES (?, ?, ?)',
            [category, name, level || 50]
        );

        res.redirect('/admin?success=skill_created');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 스킬 수정 페이지
router.get('/skills/:id/edit', async (req, res) => {
    try {
        const [skills] = await db.query('SELECT * FROM skills WHERE id = ?', [req.params.id]);

        if (skills.length === 0) {
            return res.status(404).send('스킬을 찾을 수 없습니다.');
        }

        res.render('admin/skill-form', { skill: skills[0], categories: SKILL_CATEGORIES });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 스킬 수정 처리
router.post('/skills/:id', async (req, res) => {
    try {
        const { category, name, level } = req.body;

        await db.query(
            'UPDATE skills SET category = ?, name = ?, level = ? WHERE id = ?',
            [category, name, level || 50, req.params.id]
        );

        res.redirect('/admin?success=skill_updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 스킬 삭제
router.post('/skills/:id/delete', async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
        res.redirect('/admin?success=skill_deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// About 정보 수정 페이지
router.get('/about/edit', async (req, res) => {
    try {
        const [aboutInfo] = await db.query('SELECT * FROM about_info ORDER BY display_order');
        res.render('admin/about-form', { aboutInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// About 정보 수정 처리
router.post('/about/update', async (req, res) => {
    try {
        const { start_year } = req.body;

        // years_experience 정보 업데이트
        await db.query(
            "UPDATE about_info SET value = ? WHERE section_key = 'years_experience'",
            [start_year]
        );

        res.redirect('/admin?success=about_updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

module.exports = router;
