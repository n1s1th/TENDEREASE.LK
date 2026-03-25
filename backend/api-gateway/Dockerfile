FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml ../pom.xml
COPY api-gateway/pom.xml .
COPY api-gateway/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/actuator/health || exit 1
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]
