const Certification = require('../models/Certification');

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
const getCertifications = async (req, res, next) => {
    try {
        const certifications = await Certification.find({}).sort({ issueDate: -1 });
        res.status(200).json(certifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Public
const getCertification = async (req, res, next) => {
    try {
        const certification = await Certification.findById(req.params.id);
        
        if (!certification) {
            res.status(404);
            throw new Error('Certification not found');
        }

        res.status(200).json(certification);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a certification
// @route   POST /api/certifications
// @access  Private/Admin
const createCertification = async (req, res, next) => {
    try {
        let { name, issuer, issueDate, credentialUrl, credentialId, description } = req.body;

        name = name ? name.trim() : '';
        issuer = issuer ? issuer.trim() : '';
        credentialUrl = credentialUrl ? credentialUrl.trim() : '';

        if (!name || !issuer) {
            res.status(400);
            throw new Error('Name and issuer are required');
        }

        if (!issueDate) {
            res.status(400);
            throw new Error('Issue date is required');
        }

        const date = new Date(issueDate);
        if (isNaN(date.getTime())) {
            res.status(400);
            throw new Error('Invalid issue date');
        }

        if (credentialUrl) {
            try {
                new URL(credentialUrl);
            } catch (err) {
                res.status(400);
                throw new Error('Invalid credential URL');
            }
        }

        const certification = await Certification.create({
            name,
            issuer,
            issueDate: date,
            credentialUrl,
            credentialId,
            description
        });

        res.status(201).json(certification);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a certification
// @route   PUT /api/certifications/:id
// @access  Private/Admin
const updateCertification = async (req, res, next) => {
    try {
        let { name, issuer, issueDate, credentialUrl, credentialId, description } = req.body;

        const certification = await Certification.findById(req.params.id);

        if (!certification) {
            res.status(404);
            throw new Error('Certification not found');
        }

        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                res.status(400);
                throw new Error('Name cannot be empty');
            }
            certification.name = name;
        }

        if (issuer !== undefined) {
            issuer = issuer.trim();
            if (!issuer) {
                res.status(400);
                throw new Error('Issuer cannot be empty');
            }
            certification.issuer = issuer;
        }

        if (issueDate !== undefined) {
            const date = new Date(issueDate);
            if (isNaN(date.getTime())) {
                res.status(400);
                throw new Error('Invalid issue date');
            }
            certification.issueDate = date;
        }

        if (credentialUrl !== undefined) {
            credentialUrl = credentialUrl.trim();
            if (credentialUrl) {
                try {
                    new URL(credentialUrl);
                } catch (err) {
                    res.status(400);
                    throw new Error('Invalid credential URL');
                }
            }
            certification.credentialUrl = credentialUrl;
        }

        if (credentialId !== undefined) certification.credentialId = credentialId;
        if (description !== undefined) certification.description = description;

        const updatedCertification = await certification.save();
        res.status(200).json(updatedCertification);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a certification
// @route   DELETE /api/certifications/:id
// @access  Private/Admin
const deleteCertification = async (req, res, next) => {
    try {
        const certification = await Certification.findById(req.params.id);

        if (!certification) {
            res.status(404);
            throw new Error('Certification not found');
        }

        await certification.deleteOne();
        res.status(200).json({ message: 'Certification removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCertifications,
    getCertification,
    createCertification,
    updateCertification,
    deleteCertification
};
