const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getCertifications,
    getCertification,
    createCertification,
    updateCertification,
    deleteCertification
} = require('../controllers/certificationController');

router.route('/')
    .get(getCertifications)
    .post(protect, adminRole, createCertification);

router.route('/:id')
    .get(getCertification)
    .put(protect, adminRole, updateCertification)
    .delete(protect, adminRole, deleteCertification);

module.exports = router;
