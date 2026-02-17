const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const asyncHandler = require('express-async-handler');
const Company = require('../models/Company');
const Role = require('../models/Role');
const Application = require('../models/Application');
const Student = require('../models/Student');

// @desc    Get all companies
// @route   GET /api/student/companies
// @access  Private/Student
const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find().lean();
  const roles = await Role.find().lean();

  // Attach roles to each company
  const companiesWithRoles = companies.map(company => {
    return {
      ...company,
      roles: roles.filter(role => role.companyId.toString() === company._id.toString())
    };
  });

  res.json(companiesWithRoles);
});


// @desc    Get single company
// @route   GET /api/student/companies/:id
// @access  Private/Student
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (company) {
    // Also fetch roles for this company
    const roles = await Role.find({ companyId: company._id });
    try {
      const fs = require('fs');
      fs.writeFileSync('debug_student_roles.json', JSON.stringify(roles, null, 2));
    } catch (e) { }
    res.json({ success: true, data: { company, roles } });
  } else {
    res.status(404);
    throw new Error('Company not found');
  }
});


// @desc    Get all available roles
// @route   GET /api/student/roles
// @access  Private/Student
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().populate('companyId', 'name logo');
  res.json(roles);
});


// @desc    Apply to a role
// @route   POST /api/student/apply
// @access  Private/Student
const applyJob = asyncHandler(async (req, res) => {
  const { roleId, useExistingResume } = req.body;

  const user_id = req.user._id || req.user.id;
  const student = await Student.findOne({ userId: user_id });

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found. Please complete profile first.');
  }

  // Determine resume URL
  let resumeUrl = '';
  // Check both boolean and string "true"
  if (useExistingResume === true || useExistingResume === 'true') {
    if (!student.resumeUrl) {
      res.status(400);
      throw new Error('No existing resume found in your profile. Please upload one.');
    }
    resumeUrl = student.resumeUrl;
  } } else {
      if (!req.file) {
        res.status(400);
        throw new Error('Resume file is required');
      }
    
      // Upload to Cloudinary (IMPORTANT)
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "raw",
          folder: "internship-portal",
          public_id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        }
      );
    
      resumeUrl = result.secure_url;
    
      // Delete local temp file
      const fs = require("fs");
      fs.unlinkSync(req.file.path);
    
      // Auto-sync profile resume
      student.resumeUrl = resumeUrl;
      await student.save();
    }


  // Fetch role to get companyId
  const role = await Role.findById(roleId);
  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    studentId: student._id,
    roleId: roleId
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('Already applied to this role');
  }

  const application = await Application.create({
    studentId: student._id,
    roleId: roleId,
    companyId: role.companyId,
    resumeUrl: resumeUrl
  });

  res.status(201).json({ success: true, data: application });
});




// @desc    Get my applications
// @route   GET /api/student/applications
// @access  Private/Student
const getApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user.id || req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const applications = await Application.find({ studentId: student._id })
    .populate({
      path: 'roleId',
      populate: { path: 'companyId', select: 'name' }
    });
  res.json({ success: true, data: applications });
});


// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
const getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id || req.user.id });
  if (student) {
    res.json({ success: true, data: { student } });
  } else {
    res.status(404);
    throw new Error('Student profile not found');
  }
});// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private/Student
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  let student = await Student.findOne({ userId });

  const { rollNo, branch, year, cgpa, phone, bio, github, linkedin, skills } = req.body;

  // Convert skills string to array if provided
  let skillsArray = student ? student.skills : [];
  if (skills !== undefined) {
    skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
  }

  if (student) {
    student.rollNo = rollNo || student.rollNo;
    student.branch = branch || student.branch;
    student.year = year || student.year;
    student.cgpa = cgpa !== undefined ? cgpa : student.cgpa;
    student.phone = phone !== undefined ? phone : student.phone;
    student.bio = bio !== undefined ? bio : student.bio;
    student.github = github !== undefined ? github : student.github;
    student.linkedin = linkedin !== undefined ? linkedin : student.linkedin;
    student.skills = skillsArray;

    if (req.file) {
      student.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    const updatedStudent = await student.save();
    res.json({ success: true, data: updatedStudent });
  } else {
    // Create new student profile if it doesn't exist
    student = await Student.create({
      userId,
      rollNo: rollNo || 'N/A',
      branch: branch || 'N/A',
      year: year || 'N/A',
      cgpa: cgpa || 0,
      phone: phone || '',
      bio: bio || '',
      github: github || '',
      linkedin: linkedin || '',
      skills: skillsArray,
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : ''
    });
    res.status(201).json({ success: true, data: student });
  }
});
// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private (any authenticated user)
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Resume file is required');
  }

  // Create or update student profile with resume
  let student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    // Create minimal student profile if it doesn't exist
    student = await Student.create({
      userId: req.user._id,
      rollNo: 'N/A',
      branch: 'N/A',
      year: 'N/A',
      cgpa: 0,
      resumeUrl: `/uploads/resumes/${req.file.filename}`
    });
    return res.status(201).json({ success: true, resume: student.resumeUrl });
  }

  // Update existing student's resume
  student.resumeUrl = `/uploads/resumes/${req.file.filename}`;
  await student.save();

  res.json({ success: true, resume: student.resumeUrl });
});

module.exports = {
  getCompanies,
  getCompany,
  getAllRoles,
  applyJob,
  getApplications,
  getProfile,
  updateProfile,
  uploadResume
};
