FROM node:16-alpine3.11


WORKDIR /usr/src/app
ARG NPM_TOKEN
COPY .npmrc .npmrc


# Only copy the package.json file to work directory
COPY package.json .
# Update package index and upgrade openssl
RUN apk update && apk upgrade openssl
RUN npm install


# Copy all other source code to work directory
ADD . /usr/src/app
RUN rm -f .npmrc

# TypeScript
RUN npm run build


RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub
RUN echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories
RUN apk add doppler

CMD ["doppler", "run", "--", "npm", "run", "migrate:run"]
