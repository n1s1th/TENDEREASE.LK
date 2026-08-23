# Use lightweight Java 21 runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Argument to pass which service's JAR file to copy
ARG JAR_FILE

# Copy the built jar into the container as app.jar
COPY ${JAR_FILE} app.jar

# Limit memory usage per container so your server doesn't run out of RAM
ENV JAVA_OPTS="-Xms64m -Xmx256m"

# Run the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
