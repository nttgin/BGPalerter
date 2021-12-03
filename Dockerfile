# -- trivial container for BGPalerter
FROM node:14-alpine as build

WORKDIR /opt/bgpalerter
COPY . .

# Makes the final image respect /etc/timezone configuration
RUN apk add --no-cache tzdata

RUN npm ci

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
