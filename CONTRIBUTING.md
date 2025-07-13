# Contributing to Orient Medical ERP System

Thank you for your interest in contributing to the Orient Medical Diagnostic Centre ERP System! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git
- Basic knowledge of React, TypeScript, and Node.js

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/orient-medical-erp.git`
3. Install dependencies: `npm install`
4. Copy environment template: `cp .env.example .env`
5. Configure your database connection in `.env`
6. Run database migrations: `npm run db:push`
7. Start development server: `npm run dev`

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting (ESLint/Prettier configuration)
- Use meaningful variable and function names
- Add comments for complex business logic

### File Organization
- Place React components in `client/src/components/` or `client/src/pages/`
- Add API routes in `server/routes.ts`
- Define database schemas in `shared/schema.ts`
- Keep utilities in `client/src/lib/` or `server/lib/`

### Naming Conventions
- Components: PascalCase (`PatientManagement.tsx`)
- Files: kebab-case (`patient-management.tsx`)
- Variables/Functions: camelCase (`patientData`, `fetchPatients`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)

## 🔧 Technical Standards

### Frontend (React)
- Use functional components with hooks
- Implement proper error boundaries
- Use TanStack Query for API calls
- Follow shadcn/ui component patterns
- Ensure responsive design (mobile-first)

### Backend (Node.js/Express)
- Use TypeScript for type safety
- Implement proper error handling
- Follow RESTful API conventions
- Use Drizzle ORM for database operations
- Include proper authentication checks

### Database
- Use meaningful table and column names
- Include proper foreign key relationships
- Add indexes for frequently queried columns
- Use transactions for data consistency

## 🧪 Testing

### Before Submitting
- Test your changes thoroughly
- Verify the application builds: `npm run build`
- Check TypeScript compilation: `npm run check`
- Test in both development and production modes

### Testing Checklist
- [ ] New features work as expected
- [ ] Existing functionality isn't broken
- [ ] Forms validate properly
- [ ] API endpoints return correct responses
- [ ] Database operations are successful
- [ ] UI is responsive on different screen sizes

## 📋 Pull Request Process

### Before Creating PR
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes following the guidelines above
3. Test thoroughly
4. Commit with descriptive messages
5. Push to your fork: `git push origin feature/your-feature-name`

### PR Requirements
- [ ] Clear title describing the change
- [ ] Detailed description of what was changed and why
- [ ] Screenshots for UI changes
- [ ] Reference to related issues (if applicable)
- [ ] Tests pass (if applicable)

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on different screen sizes
- [ ] Database operations verified

## Screenshots (if applicable)
Add screenshots of UI changes.
```

## 🐛 Bug Reports

### Before Reporting
- Check if the issue already exists
- Try to reproduce the bug consistently
- Test in a clean environment

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: [e.g., Chrome 96]
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 18.17.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature.

## Problem It Solves
What problem does this feature address?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Any alternative solutions considered?

## Additional Context
Any additional context or screenshots.
```

## 🏥 Medical/Healthcare Guidelines

### Data Privacy
- Never commit real patient data
- Use anonymized test data only
- Follow HIPAA-like privacy principles
- Implement proper access controls

### Medical Terminology
- Use standard medical abbreviations
- Follow ICD-10 coding standards where applicable
- Ensure medical workflows are clinically accurate
- Consult healthcare professionals for clinical features

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Project-Specific
- Review existing code patterns
- Check `shared/schema.ts` for data models
- Follow established API patterns in `server/routes.ts`
- Use existing UI components from `client/src/components/`

## 🤝 Community

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the project goals

### Getting Help
- Ask questions in GitHub Discussions
- Review existing issues and PRs
- Check documentation first
- Be specific about your problem

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Orient Medical ERP System! 🏥