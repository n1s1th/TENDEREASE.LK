# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the parent pom
COPY pom.xml .

# Copy all module poms to cache dependencies
# Use a trick to copy all poms at once if they follow a pattern, 
# but since they are in subdirectories, we list them or use a wildcard if possible.
# Docker COPY doesn't support recursive wildcard well for specific files.
# So we list the important ones or copy the whole dirs (but that's slow).
# Let's list all modules from the root pom.xml

COPY common-library/pom.xml common-library/
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY tender-service/pom.xml tender-service/
COPY bid-service/pom.xml bid-service/
COPY evaluation-service/pom.xml evaluation-service/
COPY workflow-service/pom.xml workflow-service/
COPY contract-service/pom.xml contract-service/
COPY payment-service/pom.xml payment-service/
COPY document-service/pom.xml document-service/
COPY notification-service/pom.xml notification-service/
COPY officer-dashboard-service/pom.xml officer-dashboard-service/
COPY clarification-service/pom.xml clarification-service/
COPY qa-service/pom.xml qa-service/
COPY appeal-service/pom.xml appeal-service/
COPY reporting-service/pom.xml reporting-service/

# Go offline to cache dependencies
RUN mvn dependency:go-offline -B

# Copy all source code
COPY . .

# Build all modules
RUN mvn clean install -DskipTests -B

# Final stages for each service
FROM eclipse-temurin:21-jre-alpine AS eureka-server
WORKDIR /app
COPY --from=build /app/eureka-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jre-alpine AS api-gateway
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jre-alpine AS user-service
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jre-alpine AS tender-service
WORKDIR /app
COPY --from=build /app/tender-service/target/*.jar app.jar
EXPOSE 8182
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jre-alpine AS officer-dashboard-service
WORKDIR /app
COPY --from=build /app/officer-dashboard-service/target/*.jar app.jar
EXPOSE 8193
ENTRYPOINT ["java", "-jar", "app.jar"]
