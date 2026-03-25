FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml ../pom.xml
COPY common-library ../common-library
COPY payment-service/pom.xml .
COPY payment-service/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/actuator/health || exit 1
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "app.jar"]
