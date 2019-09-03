# -- trivial container for bgpalerter
FROM node:10-alpine as build

WORKDIR /opt/bgpalerter
COPY . .

RUN yarn

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
