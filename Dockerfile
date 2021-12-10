# -- trivial container for BGPalerter
FROM node:14-alpine as build

COPY setup_build_environment.sh /app/setup_build_environment.sh
RUN /app/setup_build_environment.sh
WORKDIR /app

# Makes the final image respect /etc/timezone configuration
RUN apk add --no-cache tzdata

RUN npm ci

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
