## Description

This is a Next.js project which is both a demo for the editable-content package as well as the package itself.

## Getting Started

After downloading, run `npm install` from the command line to install all packages. Notes that the `package.json` is configured for workspaces and the editable-content package is already included. Once all packages are installed, run `npm run dev` to start the development server. In order to create a build, run `npm run build`. Once the build successfully finishes, run `npm run start` to serve the build locally. Whether running the development server or the build server, you can view the app on [http://localhost:3000](http://localhost:3000).

In order to make changes to the editable-content library, all relevant files are in `packages/editable-content`. Once changes have been made, make sure to run `tsc` from the command line within the `packages/editable-content` directory. If modifications are made to the dependencies in `packages/editable-content/package.json`, make sure to run `npm install` from the command line within the `packages/editable-content` directory.

## Further resources

To learn more about Next.js, you can see

- [Next.js documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn) for an interactive tutorial

For the live deployment of this demo, see
- [Editable Content](https://editable-content.vercel.app/), which includes the README for the editable-content library (also available in `packages/editable-content/README.md`)