# Database Design

**Database Name**: `portfolio`

## Collections / Models

1. **User / Admin**
   - Credentials for the admin portal.
   - `email`, `password` (hashed).

2. **Project**
   - Portfolio projects.
   - `title`, `description`, `techStack`, `imageUrl`, `liveUrl`, `githubUrl`, `order`.

3. **Experience**
   - Work experience.
   - `company`, `role`, `startDate`, `endDate`, `description`, `isPresent`.

4. **Skill**
   - Technical skills.
   - `name`, `category` (Frontend, Backend, etc.), `icon`, `proficiency`.

5. **Education**
   - Academic background.
   - `institution`, `degree`, `field`, `startDate`, `endDate`.

6. **Certification**
   - Professional certificates.
   - `title`, `issuer`, `date`, `url`.

7. **Blog**
   - Articles and writings.
   - `title`, `slug`, `content`, `publishedDate`, `isPublished`.

8. **Testimonial**
   - Recommendations.
   - `name`, `role`, `company`, `content`, `avatarUrl`.

9. **Message**
   - Contact form submissions.
   - `name`, `email`, `subject`, `message`, `isRead`, `createdAt`.

10. **SiteSettings**
    - Dynamic configuration (Hero text, Social Links, Resume Link).
    - `heroTitle`, `heroSubtitle`, `resumeUrl`, `socialLinks`.

**Constraints**:
- Never drop, reset, or delete the database automatically.
- Always use the `MONGODB_URI` from the environment configuration.
