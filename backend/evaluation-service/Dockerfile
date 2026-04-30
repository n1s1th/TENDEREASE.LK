FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# The context will be ./backend/evaluation-service, so target/*.jar is correct
COPY target/*.jar app.jar

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8100/actuator/health || exit 1

EXPOSE 8100
ENTRYPOINT ["java", "-jar", "app.jar"]
