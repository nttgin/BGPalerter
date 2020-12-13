# -- trivial container for bgpalerter
FROM node:12-alpine as build

WORKDIR /opt/bgpalerter
COPY . .

# Makes the final image respect /etc/timezone configuration
RUN apk add --no-cache tzdata

RUN npm install

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
