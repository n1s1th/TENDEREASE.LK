FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml ../pom.xml
RUN mvn -f ../pom.xml install -N
COPY common-library ../common-library
RUN mvn -f ../common-library/pom.xml clean install -DskipTests
COPY tender-service/pom.xml .
COPY tender-service/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8082/actuator/health || exit 1
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
