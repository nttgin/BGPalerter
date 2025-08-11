FROM node:18.19.0-alpine
WORKDIR /opt/bgpalerter

COPY . .

RUN npm ci --no-audit --prefer-offline \
  && npm run compile

FROM node:18.19.0-alpine
WORKDIR /opt/bgpalerter
COPY --from=0 /opt/bgpalerter/dist/ /opt/bgpalerter/
RUN apk add --no-cache tzdata \
  && npm ci --omit dev --no-audit --prefer-offline

CMD ["node", "index.js"]
