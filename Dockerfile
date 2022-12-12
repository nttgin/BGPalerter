# -- trivial container for BGPalerter
FROM node:19.2.0-alpine as build

WORKDIR /opt/bgpalerter
COPY . .

# Makes the final image respect /etc/timezone configuration
RUN apk add --no-cache tzdata

RUN npm ci --no-audit --prefer-offline

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
