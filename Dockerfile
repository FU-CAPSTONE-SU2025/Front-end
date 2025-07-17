FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_AISEA_API_BASEURL
ARG VITE_API_GOOGLE_CLIENT_ID
ARG VITE_API_GOOGLE_CLIENT_SECRET
ARG VITE_THERE_IS_AN_EGG
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_DATABASE_URL
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_API_AISEA_API_BASEURL=$VITE_API_AISEA_API_BASEURL
ENV VITE_API_GOOGLE_CLIENT_ID=$VITE_API_GOOGLE_CLIENT_ID
ENV VITE_API_GOOGLE_CLIENT_SECRET=$VITE_API_GOOGLE_CLIENT_SECRET
ENV VITE_THERE_IS_AN_EGG=$VITE_THERE_IS_AN_EGG
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_DATABASE_URL=$VITE_FIREBASE_DATABASE_URL
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
RUN npm run build
# building a docker image
# 1. Choose the working directory
# 2. Copy the package.json and package-lock.json files to the working directory
# 3. Install the dependencies, npm install or npm i --save
# 4. Run the build command for production build, npm run build

# Using NginX:alpine to serve the files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

# 1. Use the nginx:alpine to host, alpine is a linux distribution, very small (5MB OS) in size making it fast to host a webpage lol
# 2. Copy the build files from the build folder to the nginx html directory
# 3. Copy the nginx.conf file to the nginx conf.d directory, the nginx.conf is to adjust the nginx server: port, server name, and other configurations
# 4. Expose the port 80 - this is the Docker port 80
# 5. Run the nginx server, the -g deamon off; is to run the server in the foreground, this is to make sure that the server is running and not in the background
