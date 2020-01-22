# -- trivial container for bgpalerter
FROM node:12-alpine as build

WORKDIR /opt/bgpalerter
COPY . .

RUN npm install

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
