# AWS Amplify Setup Information

## Project Overview
This is a Next.js application hosted on AWS Amplify. The project uses modern web technologies with a focus on Arabic language support and Islamic content.

## Key AWS Amplify Configuration

### Deployment Configuration (`amplify.yml`)
The project uses AWS Amplify for continuous deployment with the following configuration:

```yaml
version: 1
applications:
  - appRoot: .
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - 'node_modules/**/*'
          - '.next/cache/**/*'
    backend:
      phases:
        build:
          commands: []
```

### Deployment Process
1. **Automatic Deployment**: Pushing to the `main` branch triggers automatic deployment
2. **Build Process**: 
   - Installs dependencies with `npm ci` (clean install)
   - Builds the Next.js application with `npm run build`
   - Deploys artifacts from `.next` directory
3. **Caching**: Node modules and Next.js cache are preserved between builds for faster deployments

### Environment Variables
The project uses environment variables for configuration:
- `.env.example` - Template for environment variables
- `.env.local` - Local development environment
- `.env.production` - Production environment variables

### Important Project Structure
- **Next.js App Router**: Uses the `/app` directory structure
- **API Routes**: Located in `/app/api` for backend functionality
- **Components**: Reusable UI components in `/components`
- **Admin Panel**: Admin functionality in `/app/admin`
- **Authentication**: NextAuth.js for user authentication

### Key Features
- Arabic language support (RTL layout)
- Chat functionality with AI characters
- Admin dashboard for content management
- Training modules and volunteer system
- Fact-checking system
- Voice synthesis and transcription

### Deployment Notes
- The project is configured for server-side rendering (SSR) with Next.js
- AWS Amplify handles SSL certificates and CDN distribution automatically
- Build artifacts are cached for faster subsequent deployments
- Environment variables must be configured in the AWS Amplify console for production

### Development Workflow
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to `main` branch
4. AWS Amplify automatically builds and deploys
5. Monitor deployment status in AWS Amplify console

### Troubleshooting
- If deployment fails, check AWS Amplify build logs
- Ensure all environment variables are properly configured
- Verify Node.js version compatibility (check `package.json` engines)
- Clear Amplify cache if build issues persist