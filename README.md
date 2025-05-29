# Pinball Package Builder

A web application for creating and packaging pinball game files, supporting VPX and Future Pinball formats.

## Features

- Upload and package VPX or FP table files
- Add supporting files (cover images, videos, DirectB2S backglasses, etc.)
- Customize file naming and organization
- Package everything into a downloadable ZIP file
- Modern, responsive UI built with React and TailwindCSS

## Deployment on GitHub Pages

This project is configured to be deployed on GitHub Pages. Follow these steps to deploy:

1. Create a new GitHub repository named `Pinball-Packager-Builder`
2. Push your code to the repository:
   ```
   git remote add origin https://github.com/yourusername/Pinball-Packager-Builder.git
   git branch -M main
   git push -u origin main
   ```
3. Go to your repository on GitHub
4. Navigate to Settings > Pages
5. Select GitHub Actions as the source
6. The deployment workflow will automatically run when you push to the main branch

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build the application for production:
   ```
   npm run build
   ```

4. Build for GitHub Pages:
   ```
   npm run build:gh-pages
   ```

## Notes for GitHub Pages Deployment

When running on GitHub Pages, the application will operate as a client-only app without the server-side components. File processing will happen entirely in the browser.

## License

MIT
