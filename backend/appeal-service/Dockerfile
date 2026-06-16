# ──────────────────────────────────────────────────────────────
# TenderEase — Appeal Service
# Build context: backend/ directory
# Usage: docker compose up --build appeal-service
# ──────────────────────────────────────────────────────────────

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY common-library ./common-library
COPY appeal-service ./appeal-service

# Strip <modules> block from parent POM so Maven doesn't look for missing sibling modules
RUN sed -i '/<modules>/,/<\/modules>/d' pom.xml && \
    mvn install -N && \
    cd common-library && mvn clean install -DskipTests && \
    cd ../appeal-service && mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build --chown=spring:spring /app/appeal-service/target/*.jar app.jar

EXPOSE 8091

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8091/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
