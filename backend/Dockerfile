# Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/retech-backend.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx350m -XX:+UseSerialGC"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
