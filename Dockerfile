FROM ubuntu

COPY setup_build_environment.sh /app/setup_build_environment.sh
RUN /app/setup_build_environment.sh
WORKDIR /app

