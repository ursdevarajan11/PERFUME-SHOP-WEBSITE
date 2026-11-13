# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Production deployment

This repository's customer storefront is Create React App, not Vite. Its build output is `frontend/build`; the separate admin app is Vite and outputs `admin/dist`. The repository-root `netlify.toml` builds and publishes the storefront. `public/_redirects` preserves React Router routes on refresh.

### Render backend

Create a Web Service from this repository with **Root Directory** `backend`, **Build Command** `npm install`, and **Start Command** `npm start`. Configure:

- `NODE_ENV=production`
- `MONGODB_URI` — MongoDB Atlas connection string for the `perfumeshop` database
- `JWT_SECRET` — a random secret of at least 32 characters
- `CORS_ORIGINS` — comma-separated exact origins for the storefront and admin sites, without trailing slashes
- `ADMIN_EMAILS` — comma-separated email addresses allowed to administer products
- `API_URL` — public Render service URL, used when constructing uploaded-image URLs
- `UPLOAD_DIR` — persistent Render disk mount path for uploaded product images
- `PORT` is supplied by Render; do not set it to a fixed value

Attach persistent storage for `UPLOAD_DIR` if product uploads must survive service restarts/redeploys. Without it, uploaded images on Render's ephemeral filesystem can disappear.

Create each administrator account before enabling its address in normal storefront registration: configure `MONGODB_URI` and `ADMIN_EMAILS` locally, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` temporarily in the backend environment, and run `npm run create-admin` from `backend`. Use a unique password of at least 12 characters; the script stores only a bcrypt hash and refuses to overwrite an existing account. Remove `ADMIN_PASSWORD` after provisioning.

### MongoDB Atlas

Create a database user with only the required read/write access to the shop database. Add the backend host's outbound IP addresses to Atlas Network Access (use a static outbound IP if available); avoid opening access broadly where possible. Put the URI only in Render's `MONGODB_URI` environment variable, URL-encode special characters in credentials, and never commit it.

### Netlify frontend

Connect the repository to Netlify and use the repository's `netlify.toml` settings: base directory `frontend`, build command `npm run build`, publish directory `build`. Set `REACT_APP_API_URL` to the public Render URL, without a trailing slash. This CRA variable is intentionally not named `VITE_API_BASE_URL`; that Vite convention applies only to the separate admin app. For the admin site, configure base directory `admin`, build command `npm run build`, publish directory `dist`, and `VITE_API_BASE_URL` to the same Render URL. Include both Netlify origins in backend `CORS_ORIGINS`.

The backend uses HttpOnly, Secure, SameSite=None cookies in production. Browsers may block cross-site cookies between unrelated Netlify and Render domains; use custom frontend/API domains under the same registrable domain if the target browsers reject them.

### Existing feature scope

Product search and category filtering run in the storefront against the loaded product catalog. The backend currently has no order, checkout, or payment API; no order functionality is claimed or configured here. Configure the local examples by copying `backend/.env.example` to `backend/.env`, `frontend/.env.example` to `frontend/.env`, and `admin/.env.example` to `admin/.env`, then replace placeholders locally. These `.env` files are ignored by Git.

Run backend smoke tests from `backend` with `npm test`; run the storefront build from `frontend` with `npm run build`.
