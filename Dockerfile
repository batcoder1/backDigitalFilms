FROM node:8.9.0
WORKDIR /src/
ENV MONGO_URI="mongodb://mongo/movies" \
  MOVIE_DB_API_KEY=""

ADD package.json ./package.json
RUN npm install
# App
ADD . ./
CMD npm start