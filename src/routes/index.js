const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 메인 페이지
router.get('/', async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
        const [skills] = await db.query('SELECT * FROM skills ORDER BY category, level DESC');
        const [aboutInfo] = await db.query('SELECT * FROM about_info ORDER BY display_order');

        // 실시간 통계 계산
        const [[projectCount]] = await db.query('SELECT COUNT(*) as count FROM projects');
        const [[skillCount]] = await db.query('SELECT COUNT(DISTINCT category) as count FROM skills');
        const [[totalSkillCount]] = await db.query('SELECT COUNT(*) as count FROM skills');

        // about_info에 동적 값 적용
        const currentYear = new Date().getFullYear();
        const dynamicAboutInfo = aboutInfo.map(info => {
            if (info.section_key === 'completed_projects') {
                return { ...info, value: `${projectCount.count}+` };
            } else if (info.section_key === 'tech_stack') {
                return { ...info, value: `${totalSkillCount.count}+` };
            } else if (info.section_key === 'years_experience') {
                // value가 연도 형식인 경우 (예: "2022")
                const startYear = parseInt(info.value);
                if (!isNaN(startYear) && startYear > 0) {
                    const years = currentYear - startYear;
                    return { ...info, value: `${years}년+` };
                }
            }
            return info;
        });

        res.render('index', { projects, skills, aboutInfo: dynamicAboutInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 프로젝트 상세 페이지
router.get('/project/:id', async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

        if (projects.length === 0) {
            return res.status(404).send('프로젝트를 찾을 수 없습니다.');
        }

        res.render('project', { project: projects[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 연락처 폼 제출
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await db.query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        res.redirect('/?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

module.exports = router;
